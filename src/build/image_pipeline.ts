import { generate_social_media_images } from "./image_pipeline/social_images"
import { generate_webp_versions } from "./image_pipeline/webp_versions"

(async () => {
   
   // 1. Generate social media images
   console.log("Generating social media images...");
   await generate_social_media_images("src/site/uploads/**/thumb_master.jpg");

   // 2. Generate WebP versions for all JPGs and PNGs
   console.log("Generating WebP versions...");
   await generate_webp_versions([
      "src/site/uploads/**/*.(jpg|png)",
      "src/site/assets/**/*.(jpg|png)",
      "src/site/courses/**/*.(jpg|png)",
      "src/site/newsletter/assets/**/*.(jpg|png)",
   ]);
})();
