import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                },
                message: "Invalid email format",
            },
        },
        role: {
            type: String,
            enum: ["customer", "admin", "seller"],
            default: "user",
        },
        avatar: {
            type: String,
        },
        type: {
            type: String,
            enum: ["male", "female"],
            default: "male",
        },
        password: {
            type: String,
            required: false,
            minlength: 6,
            // select: false,
        },
        googleId: {
            type: String,
            unique: true,
            required: false,
            sparse: true,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        provider: {
            type: String,
            enum: ["google", "local"],
            default: "local",
        },
    },
    {
        timestamps: true,
    }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcryptjs.hash(this.password, 12);
    next();
});


userSchema.methods.verifyPassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};


export const makeAavatar = (avatar, name) => {

    if (avatar)
        return avatar;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

const User = mongoose.model("User", userSchema);
export { User };
export default User;
