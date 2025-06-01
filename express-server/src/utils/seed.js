import { initialProducts } from "../product/product.fake";
import Product from "../product/product.model";

export const productSeed = async (req, res) => {
  try {

    // Clear and insert fresh data
    await Product.deleteMany({});
    await Product.insertMany(initialProducts);

    return res.status(200).json({
      success: true,
      message: "Products seeded successfully",
      total: initialProducts.length,
    });
  } catch (err) {
    console.error("Error seeding products:", err);

    return res.status(500).json({
      success: false,
      message: "Error seeding products",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};