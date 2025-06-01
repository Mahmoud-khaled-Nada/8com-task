import { catchAsyncError } from "../middlewares/common/catch.async.error.js";

export const Categories = [
  {
    _id: "68s8d390a147faef8dd937c1",
    name: "Electronics",
    description: "Devices and gadgets including phones, laptops, and accessories.",
    imageUrl: "",
  },
  {
    _id: "6y38dy90i147caef8dd937c4",
    name: "Fashion",
    description: "Clothing, footwear, and accessories for men, women, and children.",
    imageUrl: "",
  },
  {
    _id: "nn38dy90i147catr8dd937tt",
    name: "Home and Kitchen",
    description: "Furniture, appliances, and home decor.",
    imageUrl: "",
  },
  {
    _id: "rr38dy90i147caef8dd937ee",
    name: "Pet Supplies",
    description: "Cosmetics, skincare, and beauty products.",
    imageUrl: "",
  },
  {
    _id: "fh38dy90i147catr8dd937td",
    name: "Furniture",
    description: "Home and office furniture including sofas, tables, and chairs.",
    imageUrl: "",
  },
];

export const getCategoryById = catchAsyncError(async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = Categories.find(cat => cat._id === categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getAllCategories = catchAsyncError(async (req, res) => {
  try {
    res.status(200).json(Categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const addCategory = (category) => {
  Categories.push(category); // Optional, if mutation allowed
  return category;
};



export const categoryById = (categoryId) => {
  try {
    const category = Categories.find(cat => cat._id === categoryId);

    if (!category) {
      return null;
    }

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}



export const categoryByName = (name) => {
  const category = Categories.find(cat => cat.name === name);
  if (!category) return null;
  return {
    id: category._id,
    name: category.name,
  };
}