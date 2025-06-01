
import Joi from 'joi';
import { catchAsyncError } from "../middlewares/common/catch.async.error.js";
import User, { hash, makeAavatar } from "./user.model.js";
// import { sendWelcomeEmail } from './welcome.email.js';
import bcryptjs from "bcryptjs";
import { createNotification } from '../notifications/notifications.controller.js';
import { logAction } from '../audit-log/audit-log.js';


const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    avatar: Joi.string().uri().optional(),
    role: Joi.string().valid("customer", "admin", "seller").default("customer"),
    password: Joi.string().min(3).max(20)
});

export const register = catchAsyncError(async (req, res) => {
    const { error } = registerSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const hashPassword = await bcryptjs.hash(password, 12);


    const newUser = await User.create({
        name: name,
        email,
        role: role || "customer",
        avatar: makeAavatar(req.body.avatar, name),
        password: hashPassword ?? null
    });

    if (!newUser) {
        return res.status(500).json({ success: false, message: "Failed to register user" });
    }

    // sendWelcomeEmail(newUser.email, newUser.name);
    createNotification({
        title: "Welcome to Our Platform",
        message: `Hello ${newUser.name}, thank you for registering!`,
        sender: newUser._id,
        receiver: newUser._id,
        type: "info",
        isGlobal: false
    });


    await logAction({
        userId: newUser._id,
        action: "REGISTER_ACCOUN",
        metadata: { name: newUser.name, email: newUser.email },
        ipAddress: req.ip,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            id: newUser._id,
            email: newUser.email,
            avatar: newUser.avatar,
            role: newUser.role,
            name: newUser.name,
        }
    });
});

export const getUsers = catchAsyncError(async (req, res) => {
    const users = await User.find().select("-password"); // Exclude password field

    if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: "No users found" });
    }

    res.status(200).json({
        success: true,
        users: users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }))
    });
}
);



export const getUserProfile = catchAsyncError(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
    });
}
);


export const getUserById = catchAsyncError(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
    });
}
);


export const getUserByEmail = catchAsyncError(async (req, res) => {
    const email = req.params.email;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
    });
}
);


export const updateUserProfile = catchAsyncError(async (req, res) => {
    const userId = req.user.id;

    const updateSchema = Joi.object({
        name: Joi.string().min(3).max(30).optional(),
        email: Joi.string().email().optional(),
        avatar: Joi.string().uri().optional()
    });
    const { error } = updateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email, avatar },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
        }
    });
}
);


export const userSeed = catchAsyncError(async (req, res) => {

    const users = [
        {
            name: "Admin User",
            email: "admin@shop.com",
            password: "admin123",
            role: "admin",
            avatar: "https://ui-avatars.com/api/?name=Admin+User&background=random"
        },
        {
            name: "Seller John",
            email: "seller@shop.com",
            password: "seller123",
            role: "seller",
            avatar: "https://ui-avatars.com/api/?name=Seller+John&background=random"
        },
        {
            name: "Customer Jane",
            email: "customer@shop.com",
            password: "customer123",
            role: "customer",
            avatar: "https://ui-avatars.com/api/?name=Customer+Jane&background=random"
        },
        {
            name: "Demo User",
            email: "z8MlK@example.com",
            password: "password123",
            role: "customer",
            avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random"
        }
    ];

    for (const user of users) {
        await User.deleteOne({ email: user.email });

        const hashedPassword = await bcryptjs.hash(user.password, 12);

        // Create new user with hashed password
        await User.create({
            ...user,
            password: hashedPassword
        });

    }

    return true;
});
