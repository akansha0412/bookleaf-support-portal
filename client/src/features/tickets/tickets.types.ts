export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  aiCategory?: string | null;
  priority: Priority;
  aiPriority?: Priority | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  isUnresolved: boolean;
  isUrgent: boolean;
  isOverdue: boolean;
  urgency: 'URGENT' | 'OVERDUE' | 'NORMAL';
  author: { id: string; name: string; email: string };
  book?: { id: string; title: string; isbn?: string | null } | null;
  assignedAdmin?: { id: string; name: string; email: string } | null;
};

export type TicketsResult = {
  success: boolean;
  data: { tickets: Ticket[] };
};
