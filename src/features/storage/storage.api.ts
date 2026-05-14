import * as Crypto from "expo-crypto";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";

const ORDER_IMAGE_BUCKET = "pickup-order-images";

function getFileExtension(uri: string): string {
	const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
	return match?.[1]?.toLowerCase() ?? "jpg";
}

function getMimeType(extension: string): string {
	switch (extension) {
		case "png":
			return "image/png";
		case "webp":
			return "image/webp";
		case "heic":
			return "image/heic";
		default:
			return "image/jpeg";
	}
}

export async function uploadPickupOrderImage(params: {
	userId: string;
	localUri: string;
}): Promise<{
	storagePath: string;
	publicUrl: string | null;
}> {
	const extension = getFileExtension(params.localUri);
	const mimeType = getMimeType(extension);

	const file = new File(params.localUri);

	const base64 = await file.base64();

	const arrayBuffer = decode(base64);

	const fileName = `${Crypto.randomUUID()}.${extension}`;
	const storagePath = `${params.userId}/${fileName}`;

	const { error } = await supabase.storage
		.from(ORDER_IMAGE_BUCKET)
		.upload(storagePath, arrayBuffer, {
			contentType: mimeType,
			upsert: false,
		});

	throwIfSupabaseError(error);

	const { data } = supabase.storage
		.from(ORDER_IMAGE_BUCKET)
		.getPublicUrl(storagePath);

	return {
		storagePath,
		publicUrl: data.publicUrl ?? null,
	};
}