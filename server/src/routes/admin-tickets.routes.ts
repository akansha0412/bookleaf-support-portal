import { Router } from "express";
import { getAdminTickets } from "../controllers/admin-tickets.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  addInternalNote,
  assignTicketToSelf,
  getInternalNotes,
  updateTicketStatus,
  sendPublicResponse,
  generateTicketReplyDraft,
  updateTicketClassification,
} from "../controllers/admin-ticket-actions.controller.js";

const adminTicketsRouter = Router();

adminTicketsRouter.use(authenticateToken);
adminTicketsRouter.use(allowRoles("ADMIN"));
adminTicketsRouter.get("/", getAdminTickets);
adminTicketsRouter.patch("/:ticketId/assign-self", assignTicketToSelf);
adminTicketsRouter.patch("/:ticketId/status", updateTicketStatus);
adminTicketsRouter.post("/:ticketId/notes", addInternalNote);
adminTicketsRouter.get("/:ticketId/notes", getInternalNotes);
adminTicketsRouter.post("/:ticketId/responses", sendPublicResponse);
adminTicketsRouter.post("/:ticketId/draft-reply", generateTicketReplyDraft);
adminTicketsRouter.patch("/:ticketId/classification", updateTicketClassification);
export default adminTicketsRouter;
