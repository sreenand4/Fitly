"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import { X, Pencil } from "lucide-react";
import { remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { getCurrentUser } from "aws-amplify/auth";


export default function Products() {
  const router = useRouter();
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);

  // Product form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TOP");
  const [gender, setGender] = useState("UNISEX");
  const [price, setPrice] = useState("");
  const [frontEndImageUrl, setFrontEndImageUrl] = useState("");
  const [backEndImageUrl, setBackEndImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [retailerId, setRetailerId] = useState("");
  const [productsList, setProductsList] = useState<any[]>([]);

  // Add state for editing
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // When editingProduct changes, pre-fill form fields
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setType(editingProduct.type || "TOP");
      setPrice(editingProduct.price?.toString() || "");
      setGender(editingProduct.gender || "UNISEX");
      setFrontEndImageUrl(editingProduct.frontEndImageUrl || "");
      setBackEndImageUrl(editingProduct.backEndImageUrl || "");
      setNewProductModalOpen(true);
    }
  }, [editingProduct]); 

  // Immediate fetch of products
  useEffect(() => {
    // get ID first
    const getRetailerId = async () => {
        const user = await getCurrentUser();
        console.log("Retailer ID", user.userId);
        setRetailerId(user.userId);
    }
    getRetailerId();
  }, [])

  useEffect(() => {
    if (!retailerId) return;
    const fetchProducts = async () => {
      const client = generateClient<Schema>();
      const products = await client.models.Product.list({
        filter: { retailerId: { eq: retailerId } }
      });
      console.log("products", products.data);
      setProductsList(products.data);
    };
    fetchProducts();
  }, [retailerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
        const client = generateClient<Schema>();
        if (editingProduct) {
            console.log("editing product");
            const resultProduct = await client.models.Product.update({
                id: editingProduct.id,
                name: name,
                description: description,
                type: type as "TOP" | "BOTTOM" | "DRESS",
                gender: gender as "MALE" | "FEMALE" | "UNISEX",
                price: parseFloat(price),
                frontEndImageUrl: frontEndImageUrl,
                backEndImageUrl: backEndImageUrl,
            });
            console.log("product updated", resultProduct);
            setProductsList(productsList.map(product => product.id === editingProduct.id ? resultProduct.data : product));
        } else {
            console.log("creating product");
            const resultProduct = await client.models.Product.create({
                name: name,
                description: description,
                type: type as "TOP" | "BOTTOM" | "DRESS",
                gender: gender as "MALE" | "FEMALE" | "UNISEX",
                price: parseFloat(price),
                frontEndImageUrl: frontEndImageUrl,
                backEndImageUrl: backEndImageUrl,
                retailerId: retailerId
            });
            console.log("product created", resultProduct);
            setProductsList([...productsList, resultProduct.data]);
        }
    } catch (error) {
        console.error("Error creating product:", error);
        alert("Error creating product");
    }
    setIsSubmitting(false);
    setNewProductModalOpen(false);
    setName("");
    setDescription("");
    setType("TOP");
    setPrice("");
    setGender("UNISEX");
    setFrontEndImageUrl("");
    setBackEndImageUrl("");
    setEditingProduct(null);
  };

  const removeImage = async (url: string) => {
    // Extract the path from the URL
    const path = url.split('/').pop();
    console.log("path to remove", path);
    if (!path) return;
    // Remove from S3
    try {
      const result = await remove({ path: `product-images/${path}` });
      console.log("image removed from s3", result);
      // Clear the correct image state
      if (url === frontEndImageUrl) setFrontEndImageUrl("");
      if (url === backEndImageUrl) setBackEndImageUrl("");
      console.log("image states cleared");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setType("TOP");
    setPrice("");
    setFrontEndImageUrl("");
    setBackEndImageUrl("");
    setGender("UNISEX");
    setNewProductModalOpen(true);
  }

  const handleDelete = async (id: string) => {
    const client = generateClient<Schema>();
    // remove from frontend
    setProductsList(productsList.filter(product => product.id !== id));
    console.log("product removed from frontend", id);
    // remove from backend
    await client.models.Product.delete({ id: id });
    console.log("product removed from backend", id);
    // remove from s3
    removeImage(editingProduct?.frontEndImageUrl);
    removeImage(editingProduct?.backEndImageUrl);
    console.log("product removed from s3", id);
    setNewProductModalOpen(false);
    setEditingProduct(null);
  }

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row justify-center">
         {/* Products */}
        <div className="w-full h-full flex flex-col mt-30 md:mt-20 gap-10 px-10 md:px-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end border-b-2 border-[var(--taupe)]] justify-between pt-10 pb-4 gap-4 sm:gap-0">
                <div className="flex flex-col">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl">Manage Products</h1>
                    <p className="font-sans">Add, edit, and delete your products here</p>
                </div>
                <button className="bg-[var(--taupe)] text-white border border-[var(--taupe)] rounded-full px-5 py-2 text-sm cursor-pointer font-sans self-start sm:self-auto" onClick={() => { openNewProductModal(); }}>+ New Product</button>
            </div>
            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 p-4 justify-items-center">
              {productsList.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-[var(--bone)] rounded-xl shadow-md p-2 flex flex-col items-center group transition hover:shadow-lg"
                  style={{ width: 180, minWidth: 180, height: 320 }}
                >
                  <div className="relative w-full h-[220px] mb-2 overflow-hidden rounded-lg">
                    <img
                      src={product.frontEndImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                    />
                    <img
                      src={product.backEndImageUrl}
                      alt={product.name + ' (Back)'}
                      className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                  <div className="w-full flex flex-col items-start">
                    <span className="font-bold text-base text-[var(--jet)] font-sans">{product.name}</span>
                    <span className="text-xs text-[var(--jet)] font-sans mb-1 line-clamp-2">{product.description}</span>
                    <span className="text-sm text-[var(--taupe)] font-semibold font-sans">${product.price}</span>
                    <span className="text-xs text-[var(--jet)] font-sans mb-1 line-clamp-2">{product.gender === "MALE" ? "Men's" : product.gender === "FEMALE" ? "Women's" : "Unisex"}</span>
                  </div>
                  <button
                    className="absolute bottom-2 right-2 bg-[var(--taupe)] text-white rounded-full p-1.5 shadow hover:bg-[var(--jet)] transition"
                    onClick={() => setEditingProduct(product)}
                    title="Edit Product"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {newProductModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setEditingProduct(null); setNewProductModalOpen(false);}}></div>
                    <div className="relative bg-[var(--bone)] rounded-2xl p-8 md:max-w-[50vw] w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <button 
                          onClick={() => setNewProductModalOpen(false)}
                          className="absolute top-8 right-4 text-[var(--bone)] bg-[var(--taupe)] rounded-full p-2"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 font-sans text-[var(--jet)]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                          <label className="font-sans text-[var(--jet)] text-sm font-semibold">Product Name
                            <input type="text" className="mt-1 w-full border border-[var(--taupe)] rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                          </label>
                          <label className="font-sans text-[var(--jet)] text-sm font-semibold">Description
                            <textarea className="mt-1 w-full border border-[var(--taupe)] rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                          </label>
                          <label className="font-sans text-[var(--jet)] text-sm font-semibold">Type
                            <select className="mt-1 w-full border border-[var(--taupe)] rounded-lg px-3 py-2" value={type} onChange={e => setType(e.target.value)} required>
                              <option value="TOP">Top</option>
                              <option value="BOTTOM">Bottom</option>
                              <option value="DRESS">Dress</option>
                            </select>
                          </label>
                          <label className="font-sans text-[var(--jet)] text-sm font-semibold">Gender
                            <select className="mt-1 w-full border border-[var(--taupe)] rounded-lg px-3 py-2" value={gender} onChange={e => setGender(e.target.value)} required>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="UNISEX">Unisex</option>
                            </select>
                          </label>
                          <label className="font-sans text-[var(--jet)] text-sm font-semibold">Price ($)
                            <input type="number" min="0" step="0.01" className="mt-1 w-full border border-[var(--taupe)] rounded-lg px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
                          </label>
                          <div className="flex gap-8">
                            <div className="flex-1">
                              <span className="font-sans text-[var(--jet)] text-sm font-semibold mb-2">Front Image</span>
                              <div>
                                  {!frontEndImageUrl && (
                                  <ImageUploader
                                      key="front"
                                      onUploadSuccess={setFrontEndImageUrl}
                                      folder="product-images"
                                  />
                                  )}
                                  {frontEndImageUrl && (
                                  <>
                                      <img src={frontEndImageUrl} alt="Front" className="mt-2 w-24 h-24 object-cover rounded-lg border border-[var(--taupe)]" />
                                      <span className="text-red-500 py-2 font-sans mt-4 cursor-pointer" onClick={() => removeImage(frontEndImageUrl)}>remove</span>
                                  </>
                                  )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <span className="font-sans text-[var(--jet)] text-sm font-semibold mb-2">Back Image</span>
                              <div>   
                                  {!backEndImageUrl && (
                                      <ImageUploader
                                          key="back"
                                          onUploadSuccess={setBackEndImageUrl}
                                          folder="product-images"
                                      />
                                  )}
                                  {backEndImageUrl && (
                                  <>
                                      <img src={backEndImageUrl} alt="Back" className="mt-2 w-24 h-24 object-cover rounded-lg border border-[var(--taupe)]" />
                                      <span className="text-red-500 py-2 font-sans mt-4 cursor-pointer" onClick={() => removeImage(backEndImageUrl)}>remove</span>
                                  </>
                                  )}
                              </div>
                            </div>
                          </div>
                          {error && <div className="text-red-500 text-sm font-sans">{error}</div>}
                          <div className="flex w-full gap-4">
                            {/* delete button */}
                            {editingProduct && (
                              <button 
                                type="button" 
                                className="flex-1 bg-[var(--bone)] text-[var(--taupe)] border border-[var(--taupe)] rounded-full px-6 py-2 font-sans mt-2 disabled:opacity-50" 
                                disabled={isSubmitting}
                                onClick={() => {
                                    handleDelete(editingProduct.id);
                                }}>
                                Delete Product
                              </button>
                            )}
                            {/* edit button */}
                            <button 
                              type="submit" 
                              className="flex-1 bg-[var(--taupe)] text-white rounded-full px-6 py-2 font-sans mt-2 disabled:opacity-50" 
                              disabled={isSubmitting}
                              onClick={handleSubmit}>
                              {editingProduct ? (isSubmitting ? "Editing..." : "Edit Product") : (isSubmitting ? "Adding..." : "Add Product")}
                            </button>
                          </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}