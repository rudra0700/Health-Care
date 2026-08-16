/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createSpecialityZodSchema } from "@/zod/specialities.validation";
import { revalidateTag } from "next/cache";

export async function createSpeciality(_prevState: any, formData: FormData) {
  try {
    const payload = {
      title: formData.get("title") as string,
    };
    if (zodValidator(payload, createSpecialityZodSchema).success === false) {
      return zodValidator(payload, createSpecialityZodSchema);
    }

    const validatedPayload = zodValidator(
      payload,
      createSpecialityZodSchema,
    ).data;

    const newFormData = new FormData();
    newFormData.append("data", JSON.stringify(validatedPayload));

    if (formData.get("file")) {
      newFormData.append("file", formData.get("file") as Blob);
    }

    const response = await serverFetch.post("/specialities", {
      body: newFormData,
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("specialities-list", { expire: 0 });
    }

    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Something went wrong"}`,
    };
  }
}

export async function getSpecialities() {
  try {
    const response = await serverFetch.get("/specialities", {
      next: {
        tags: ["specialities-list"],
        revalidate: 600, // 10 minutes - specialties rarely change
      },
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Something went wrong"}`,
    };
  }
}

export async function deleteSpeciality(id: string) {
  try {
    const response = await serverFetch.delete(`/specialities/${id}`);
    const result = await response.json();
    if (result.success) {
      revalidateTag("specialities-list", { expire: 0 });
      revalidateTag(`specialty-${id}`, { expire: 0 });
      revalidateTag("doctors-list", { expire: 0 }); // Doctors have
    }
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Something went wrong"}`,
    };
  }
}
