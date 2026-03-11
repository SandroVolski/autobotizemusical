import { useMemo } from "react";
import { usePagamentos, type Pagamento } from "@/hooks/usePagamentos";
import { type Aluno } from "@/hooks/useAlunos";

export type PaymentStatusColor = "green" | "yellow" | "red" | "gray";

export interface StudentPaymentStatus {
  color: PaymentStatusColor;
  label: string;
}

/**
 * Determines the payment status for a student based on their dia_vencimento
 * and their payment records.
 * 
 * Logic:
 * - green: student has paid for the current month (or ahead)
 * - yellow: payment is due this week (within 7 days before due date) and not yet paid
 * - red: past the due date and not paid for the current month
 * - gray: no dia_vencimento set or student is inactive
 */
export function getStudentPaymentStatus(
  aluno: Aluno,
  pagamentos: Pagamento[],
  today: Date = new Date()
): StudentPaymentStatus {
  // If no due day set or student is inactive, gray
  if (!aluno.dia_vencimento || aluno.status !== "ativo") {
    return { color: "gray", label: "Sem vencimento" };
  }

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const diaVencimento = aluno.dia_vencimento;

  // Get all payments for this student that are mensalidade type and pago
  const studentPayments = pagamentos.filter(
    (p) => p.aluno_id === aluno.id && p.status === "pago"
  );

  // Check if student has paid for current month or ahead
  // We check by looking at payments with data_vencimento in the current month or future
  const hasPaidCurrentMonth = studentPayments.some((p) => {
    if (!p.data_vencimento) return false;
    const payDate = new Date(p.data_vencimento + "T00:00:00");
    const payMonth = payDate.getMonth();
    const payYear = payDate.getFullYear();
    // Payment is for current month or future months
    return (
      payYear > currentYear ||
      (payYear === currentYear && payMonth >= currentMonth)
    );
  });

  if (hasPaidCurrentMonth) {
    return { color: "green", label: "Em dia" };
  }

  // Not paid - check if past due or approaching
  if (currentDay > diaVencimento) {
    // Past the due date this month
    return { color: "red", label: "Atrasado" };
  }

  // Check if due date is within the next 7 days (alert zone)
  const daysUntilDue = diaVencimento - currentDay;
  if (daysUntilDue <= 7) {
    return { color: "yellow", label: "Vence em breve" };
  }

  // Still has time, but hasn't paid yet - show as pending (no dot needed, or gray)
  return { color: "yellow", label: "Pendente" };
}

/**
 * Hook that returns a map of student ID -> payment status
 */
export function usePaymentStatuses(alunos?: Aluno[]) {
  const { data: pagamentos } = usePagamentos();

  return useMemo(() => {
    const statusMap = new Map<string, StudentPaymentStatus>();
    if (!alunos || !pagamentos) return statusMap;

    const today = new Date();
    for (const aluno of alunos) {
      statusMap.set(aluno.id, getStudentPaymentStatus(aluno, pagamentos, today));
    }
    return statusMap;
  }, [alunos, pagamentos]);
}
