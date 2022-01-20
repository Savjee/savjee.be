import { stat } from "fs/promises";
import { Stats } from "node:fs";

export async function fileExists(path: string): Promise<boolean|Stats>{
    const stats = await stat(path).catch((e) => {
        return false;
    });

    return stats;
}