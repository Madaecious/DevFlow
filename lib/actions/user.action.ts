"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

// Get user by ID --------------------------------------------------------------
export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Create user -----------------------------------------------------------------
export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Update User -----------------------------------------------------------------
export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Delete user -----------------------------------------------------------------
export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    // Note: it doesn't appear that this is correct.
    // It appears that it deletes the user here and again below.
    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete user from database, questions, answers, comments, etc.
    // Note: it doesn't appear that "user._id" is correct
    // eslint-disable-next-line no-unused-vars
    const userQuestionIds = await Question.find({ author: user }).distinct(
      "_id"
    );
    // delete user questions
    await Question.deleteMany({ author: user });

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
