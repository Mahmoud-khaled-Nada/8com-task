
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: String,
        metadata: mongoose.Schema.Types.Mixed,
        ipAddress: { type: String, required: false },
    },
    { timestamps: true }
);


export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
