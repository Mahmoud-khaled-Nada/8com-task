import AuditLog from "./audit-log.model.js";


export const logAction = async ({
    userId,
    action,
    metadata,
    ipAddress,
}) => {
    try {
        await AuditLog.create({ userId, action, metadata, ipAddress });
    } catch (error) {
        console.error("Failed to log action:", error);
    }
};
