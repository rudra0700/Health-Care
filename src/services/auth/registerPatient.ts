/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { loginUser } from "./loginUser";
import { zodValidator } from "@/lib/zodValidator";
import { registerValidationZodSchema } from "@/zod/auth.validation";

export const registerPatient = async (
  _currentState: any,
  formData: any,
): Promise<any> => {
  try {
    const payload = {
      name: formData.get("name"),
      address: formData.get("address"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (zodValidator(payload, registerValidationZodSchema).success === false) {
      return zodValidator(payload, registerValidationZodSchema);
    }

    const validatedPayload: any = zodValidator(
      payload,
      registerValidationZodSchema,
    ).data;

    const registerData = {
      password: validatedPayload.password,
      patient: {
        name: validatedPayload.name,
        address: validatedPayload.address,
        email: validatedPayload.email,
      },
    };

    const newFormData = new FormData();

    if (formData.get("file")) {
      newFormData.append("file", formData.get("file") as Blob);
    }

    newFormData.append("data", JSON.stringify(registerData));

    const res = await fetch(
      "http://localhost:5000/api/v1/user/create-patient",
      {
        method: "POST",
        body: newFormData,
      },
    );

    const result = await res.json();

    if (result.success) {
      await loginUser(_currentState, formData);
    }

    return result;
  } catch (error: any) {
    console.log(error);
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Registration failed" };
  }
};
