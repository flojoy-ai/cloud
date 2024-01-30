import { type NextRequest } from "next/server";
import { publicInsertMeasurementSchema } from "~/types/measurement";
import { db } from "~/server/db";
import { hardware, measurement, test } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  ErrorWithStatus,
  generateError,
  measurementRouteAuthCheck,
} from "./utils";
import { uploadToS3 } from "~/lib/s3";

export const POST = async (req: NextRequest) => {
  try {
    const workspaceSecret = req.headers.get("Authorization");

    const body = (await req.json()) as typeof publicInsertMeasurementSchema;

    const parsedBody = publicInsertMeasurementSchema.safeParse(body);

    if (!parsedBody.success) {
      return generateError(
        parsedBody.error.errors
          .map((e) => {
            return `${e.path[0]} is ${e.message}`;
          })
          .join("\n"),
        422,
      );
    }
    const { hardwareId, testId } = await measurementRouteAuthCheck({
      workspaceSecret,
      inputHardwareId: parsedBody.data.hardwareId,
      inputTestId: parsedBody.data.testId,
    });

    const formData = await req.formData();
    let imageURL = "";
    if (formData.get("file")) {
      imageURL = await uploadToS3(formData.get("file") as File);
    }

    await db.transaction(async (tx) => {
      const [measurementCreateResult] = await tx
        .insert(measurement)
        .values({
          ...parsedBody.data,
          image: imageURL,
          storageProvider: "postgres", // TODO: make this configurable
        })
        .returning();

      if (!measurementCreateResult) {
        return generateError("Failed to create measurement", 500);
      }

      await tx
        .update(test)
        .set({ updatedAt: new Date() })
        .where(eq(test.id, testId));

      await tx
        .update(hardware)
        .set({ updatedAt: new Date() })
        .where(eq(hardware.id, hardwareId));
    });

    return new Response(
      JSON.stringify({
        message: "Measurement created successfully",
      }),
      {
        status: 201,
      },
    );
  } catch (e) {
    if (e instanceof ErrorWithStatus) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.status,
      });
    }
    return new Response(
      JSON.stringify({
        error: "An unknown error occurred: " + String(e),
      }),
      {
        status: 500,
      },
    );
  }
};
