 import React, { useEffect, useRef, useState } from "react";
 import Sidebar from "../partials/Sidebar";
 import Header from "../partials/Header";
 import { toast } from "react-hot-toast";
 import { useNavigate } from "react-router-dom";
 import PageTitleBanner from "../components/banner/PageTitleBanner";
 import { useCreateProductMutation } from "../features/product/productApi";
 import { Cropper } from "react-cropper";
 import { useGetAllProductsCategoryQuery } from "../features/category/categoryApi";
 import { BsPlus } from "react-icons/bs";
 import { BiPlus } from "react-icons/bi";
 import { SketchPicker } from "react-color";
 import reactCSS from "reactcss";
 import Slider from "@mui/material/Slider";

 const AddNewProduct = () => {
   const token = localStorage.getItem("adminToken");
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [brand, setBrand] = useState("");
   const [barCode, setBarCode] = useState("");
   const [sku, setSku] = useState("");

   const navigate = useNavigate();
   const [selectedCategory, setSelectedCategory] = useState({});
   const [selectedSubCategory, setSelectedSubCategory] = useState({});
   const [selectChildCategory, setSelectChildCategory] = useState({});
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [tags, setTags] = useState([]);
   const [imageUrl, setImageUrl] = useState();
   const inputFileRef = useRef(null);
   const cropperRef = useRef(null);
   const [croppedImage, setCroppedImage] = useState(null);
   const [showModal, setShowModal] = useState(false);
   const [croppedImageFile, setCroppedImageFile] = useState(null);
   const [hasColor, setHasColor] = useState("");
   const [displayColorPicker, setDisplayColorPicker] = useState(false);
   const [selectedVariantImage, setSelectedVariantImage] = useState(null);
   const [variantImage, setVariantImage] = useState(null);
   const [images, setImages] = useState([]);
   const [color, setColor] = useState({
     r: "255",
     g: "0",
     b: "0",
     a: "1",
   });
   const [variants, setVariants] = useState([]);

   const { data: allCategory } = useGetAllProductsCategoryQuery();

   const [createProduct, { isLoading, isSuccess, isError, error }] =
     useCreateProductMutation();

   const handleTagInput = (event) => {
     if (event.key === "Enter") {
       event.preventDefault();
       const newTag = event.target.value.trim();
       if (newTag?.length > 0 && !tags.includes(newTag)) {
         setTags([...tags, newTag]);
         event.target.value = "";
       }
     }
   };
   const handleFileChange = (event) => {
     const file = event.target.files[0];
     const reader = new FileReader();
     setImageUrl(event.target.files[0]);
     reader.onload = () => {
       setCroppedImage(reader.result);
       setShowModal(true);
     };

     reader.readAsDataURL(file);
   };

   const handleCategoryChange = (e) => {
     const selectedOption = JSON.parse(e.target.value);
     setSelectedCategory(selectedOption);
   };

   const handleSubCategoryChange = (e) => {
     const selectedOption = JSON.parse(e.target.value);
     setSelectedSubCategory(selectedOption);
   };
   const handleChildCategoryChange = (e) => {
     const selectedOption = JSON.parse(e.target.value);
     setSelectChildCategory(selectedOption);
   };

   const handleTagDelete = (tag) => {
     setTags(tags.filter((t) => t !== tag));
   };

   const handleCreateNewProduct = (e) => {
     e.preventDefault();

     const category = {
       category: selectedCategory?.category,
       categoryDetails: selectedCategory?._id,
     };
     const subCategory = selectedSubCategory?._id;
     const childCategory = selectChildCategory?._id;
     const thumbnail = imageUrl;

     // Get the selected file
     const data = new FormData();
     data.append("title", title);
     data.append("description", description);
     data.append("category", JSON.stringify(category));
     data.append("subCategory", subCategory);
     data.append("childCategory", childCategory);
     data.append("brand", brand);
     data.append("sku", sku);
     data.append("barCode", barCode);
     data.append("tags", JSON.stringify(tags));
     data.append("variants", JSON.stringify(variants));

     if (croppedImageFile) {
       data.append("thumbnail", croppedImageFile); // Append the cropped image file
     } else {
       data.append("thumbnail", thumbnail);
     }
     if (images?.length) {
       images.forEach((image, index) => {
         const blob = new Blob([image], { type: image.type });
         data.append(`images[${index}]`, blob, image.name);
       });
     }
     console.log({ selectedCategory });
     createProduct({ data, token });
   };

   useEffect(() => {
     if (isLoading) {
       toast.loading("Loading...", { id: "createProduct" });
     }

     if (isSuccess) {
       toast.success("Successfully created !!", { id: "createProduct" });
     }
     if (isError) {
       toast.error(error?.data?.error, {
         id: "createProduct",
       });
     }
   }, [isLoading, isSuccess, isError, error]);

   //cropper

   const handleConfirmCrop = () => {
     if (!cropperRef.current || !cropperRef.current.cropper) {
       return;
     }
     const canvas = cropperRef.current.cropper.getCroppedCanvas();
     if (canvas) {
       canvas.toBlob((blob) => {
         setCroppedImage(URL.createObjectURL(blob));
         setCroppedImageFile(blob); // Set the cropped image file
         setShowModal(false);
       }, "image/jpeg");
     }
   };
   const handleCloseModal = () => {
     setShowModal(false);
     setCroppedImage(null);
   };

   const handleClick = () => {
     setDisplayColorPicker(!displayColorPicker);
   };

   const handleClose = () => {
     setDisplayColorPicker(false);
   };

   const handleChange = (selectedColor) => {
     setColor(selectedColor.rgb);
   };

   const styles = reactCSS({
     default: {
       color: {
         width: "36px",
         height: "14px",
         borderRadius: "2px",
         background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
       },

       swatch: {
         padding: "5px",
         background: "#fff",
         borderRadius: "1px",
         boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
         display: "inline-block",
         cursor: "pointer",
       },
       popover: {
         position: "absolute",
         left: "60%",
         zIndex: "2",
       },
       cover: {
         position: "fixed",
         top: "0px",
         right: "0px",
         bottom: "0px",
         left: "0px",
       },
     },
   });

   const handleVariantForm = (event) => {
     event.preventDefault();
     const image = selectedVariantImage;
     const size = event.target.productSize.value;
     const oldPrice = event.target.oldPrice.value;
     const price = event.target.productPrice.value;
     const stock = event.target.stock.value;

     // Check if a variant with the same size and color already exists
     const variantExists = variants.some(
       (variant) => variant.size === size && variant.color === color
     );

     if (variantExists) {
       toast.error("Variant already exists");
     } else {
       // Variant does not exist, so add it to the array
       setVariants((prevVariants) => [
         ...prevVariants,
         {
           image,
           size,
           oldPrice,
           price,
           stock,
           color,
         },
       ]);

       setImages((prev) => [...prev, variantImage]);
     }
   };

   useEffect(() => {
     console.log(variants);
   }, [variants]);

   const handleVariantImageChange = (e) => {
     const file = e.target.files[0];
     if (file) {
       setVariantImage(file);
       // You can use FileReader to read the selected image and set it in state
       const reader = new FileReader();
       reader.onload = (event) => {
         setSelectedVariantImage(event.target.result);
       };
       reader.readAsDataURL(file);
     }
   };

   return (
     <div className="flex h-screen overflow-hidden">
       {/* Sidebar */}
       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

       {/* Content area */}
       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden ">
         {/*  Site header */}
         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
         <main>
           <PageTitleBanner
             title={"Add New Product"}
             subTitle={"Expand your inventory and reach new customers"}
           />
           <div className="px-4 sm:px-6 lg:px-8 shadow-lg pt-3 pb-10 border mx-8 rounded-md shadow-lg lg:mb-8">
             <div className="space-y-6">
               <div className="pb-6">
                 <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 ">
                   <div className="col-span-full">
                     <label
                       htmlFor="title"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product Title/Name
                     </label>
                     <div className="mt-2">
                       <input
                         placeholder="Product Title / Name"
                         id="title"
                         onChange={(e) => setTitle(e.target.value)}
                         name="title"
                         required
                         type="text"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       />
                     </div>
                   </div>

                   <div className="col-span-full">
                     <label
                       htmlFor="description"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product Description
                     </label>
                     <div className="mt-2">
                       <textarea
                         placeholder="Product Description"
                         id="description"
                         name="description"
                         onChange={(e) => setDescription(e.target.value)}
                         required
                         rows="3"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       ></textarea>
                     </div>
                   </div>

                   <div className="col-span-full">
                     <label
                       htmlFor="cover-photo"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product Thumbnail Image
                     </label>
                     <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                       <div className="text-center">
                         {!croppedImage ? (
                           <svg
                             className="mx-auto h-12 w-12 text-gray-300"
                             viewBox="0 0 24 24"
                             fill="currentColor"
                             aria-hidden="true"
                           >
                             <path
                               fillRule="evenodd"
                               d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                               clipRule="evenodd"
                             />
                           </svg>
                         ) : (
                           <img
                             className="w-[100px] h-[100px] mx-auto"
                             src={croppedImage}
                           ></img>
                         )}

                         <div className="mt-4 flex text-sm leading-6 text-gray-600">
                           <label
                             htmlFor="file-upload"
                             className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                           >
                             <span className="text-center ">Upload a file</span>
                             <input
                               id="file-upload"
                               name="thumbnail"
                               onChange={handleFileChange}
                               type="file"
                               required
                               accept=""
                               className="sr-only"
                             />
                           </label>
                           <p className="pl-1">or drag and drop</p>
                         </div>
                         <p className="text-xs leading-5 text-gray-600">
                           PNG, JPG, GIF up to 10MB
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="">
                 <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-6 ">
                   <div className="sm:col-span-2">
                     <label
                       htmlFor="email"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Brand
                     </label>
                     <div className="mt-2">
                       <input
                         placeholder="Brand Name"
                         id="text"
                         onChange={(e) => setBrand(e.target.value)}
                         required
                         name="brand"
                         type="text"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       />
                     </div>
                   </div>
                   <div className="sm:col-span-2">
                     <label
                       htmlFor="last-name"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product Barcode
                     </label>
                     <div className="mt-2">
                       <input
                         type="text"
                         name="barCode"
                         required
                         onChange={(e) => setBarCode(e.target.value)}
                         id="last-name"
                         autoComplete="family-name"
                         placeholder="Product Barcode"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       />
                     </div>
                   </div>
                   <div className="sm:col-span-2">
                     <label
                       htmlFor="first-name"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product SKU
                     </label>
                     <div className="mt-2">
                       <input
                         type="text"
                         name="sku"
                         required
                         onChange={(e) => setSku(e.target.value)}
                         id="first-name"
                         placeholder="Product SKU"
                         autoComplete="given-name"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       />
                     </div>
                   </div>
                   <div className="sm:col-span-2">
                     <label
                       htmlFor="country"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Category
                     </label>
                     <div className="mt-2">
                       <select
                         id="category"
                         required
                         name="category"
                         onChange={handleCategoryChange}
                         autoComplete="country-name"
                         className="block w-full capitalize  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       >
                         <option selected disabled>
                           Select Category
                         </option>
                         {allCategory?.data?.map((category, index) => (
                           <option
                             key={index}
                             value={JSON.stringify(category)}
                             className="capitalize"
                           >
                             {category?.category}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>
                   <div className="sm:col-span-2">
                     <div className="flex justify-between">
                       <label
                         htmlFor="country"
                         className="block  font-medium leading-6 text-gray-900"
                       >
                         Sub Category
                       </label>
                       {selectedCategory?.category &&
                         !selectedCategory?.subCategories?.length && (
                           <button
                             onClick={() =>
                               navigate(
                                 `/product/categories/subcategories/new/${selectedCategory?._id}`
                               )
                             }
                             className="flex gap-r-1 font-semibold  items-center bg-green-100 text-xs text-green-500  px-2 rounded-xl"
                           >
                             <BiPlus className="text-lg" />
                             Add Sub category
                           </button>
                         )}
                     </div>
                     <div className="mt-2">
                       <select
                         id="subCategory"
                         required
                         name="subCategory"
                         onChange={handleSubCategoryChange}
                         autoComplete="country-name"
                         className="block w-full capitalize  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       >
                         {selectedCategory?.subCategories?.length ? (
                           <>
                             <option disabled selected>
                               Select Category
                             </option>

                             {selectedCategory.subCategories.map(
                               (subCategory, index) => (
                                 <option
                                   key={index}
                                   value={JSON.stringify(subCategory)}
                                   className="capitalize"
                                 >
                                   {subCategory?.subCategoryTitle}
                                 </option>
                               )
                             )}
                           </>
                         ) : (
                           <>
                             <option selected disabled>
                               No Sub Category available
                             </option>
                           </>
                         )}
                       </select>
                     </div>
                   </div>
                   <div className="sm:col-span-2">
                     <div className="flex justify-between">
                       <label
                         htmlFor="country"
                         className="block  font-medium leading-6 text-gray-900"
                       >
                         Child Category
                       </label>
                       {selectedSubCategory?.childCategories &&
                         !selectedSubCategory?.childCategories?.length && (
                           <button
                             // onClick={() =>
                             //   navigate(
                             //     `/product/categories/subcategories/new/${selectedCategory?._id}`
                             //   )
                             // }
                             className="flex gap-r-1 font-semibold  items-center bg-green-100 text-xs text-green-500  px-2 rounded-xl"
                           >
                             <BiPlus className="text-lg" />
                             Add Child category
                           </button>
                         )}
                     </div>
                     <div className="mt-2">
                       <select
                         id="childCategory"
                         required
                         name="childCategory"
                         onChange={handleChildCategoryChange}
                         autoComplete="country-name"
                         className="block w-full capitalize  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                       >
                         {selectedSubCategory?.childCategories?.length ? (
                           <>
                             <option disabled selected>
                               Select Child Category
                             </option>

                             {selectedSubCategory?.childCategories?.map(
                               (childCategory, index) => (
                                 <option
                                   key={index}
                                   value={JSON.stringify(childCategory)}
                                   className="capitalize"
                                 >
                                   {console.log(childCategory)}
                                   {childCategory?.childCategoryTitle}
                                 </option>
                               )
                             )}
                           </>
                         ) : (
                           <>
                             <option selected disabled>
                               No Child Category available
                             </option>
                           </>
                         )}
                       </select>
                     </div>
                   </div>

                   <div className="sm:col-span-6">
                     <label
                       htmlFor="postal-code"
                       className="block text-sm font-medium leading-6 text-gray-900"
                     >
                       Product Tags
                     </label>
                     <div className="mt-2 flex flex-wrap">
                       <input
                         type="text"
                         placeholder="Product Tag (Write then press enter to add new tag"
                         className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                         onKeyDown={handleTagInput}
                       />
                       {tags.map((tag) => (
                         <span
                           key={tag}
                           className="bg-gray-200 rounded-full px-3 py-1 m-1 flex items-center"
                         >
                           <span className="text-sm font-medium">{tag}</span>
                           <button
                             type="button"
                             onClick={() => handleTagDelete(tag)}
                             className="ml-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                           >
                             <span className="sr-only">Remove tag</span>
                             <svg
                               className="h-4 w-4"
                               viewBox="0 0 20 20"
                               fill="currentColor"
                               aria-hidden="true"
                             >
                               <path
                                 fillRule="evenodd"
                                 d="M10 1c4.972 0 9 4.029 9 9s-4.028 9-9 9-9-4.029-9-9 4.028-9 9-9zm3.707 11.293a1 1 0 00-1.414 1.414L9 11.414l-3.293 3.293a1 1 0 00-1.414-1.414L7.586 10l-3.293-3.293a1 1 0 011.414-1.414L9 8.586l3.293-3.293a1 1 0 011.414 1.414L10.414 10l3.293 3.293z"
                                 clipRule="evenodd"
                               />
                             </svg>
                           </button>
                         </span>
                       ))}
                     </div>
                   </div>
                   {/* start product variant  */}
                 </div>

                 <div className="p-8 border rounded-md mt-8 shadow">
                   {/* product variant start from here  */}
                   <h3 className="text-xl font-bold mt-5 text-center">
                     product variant
                   </h3>

                   <form onSubmit={handleVariantForm}>
                     <div className="mt-5 grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-2">
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="image"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Image
                         </label>
                         <div className="mt-2">
                           <input
                             onChange={handleVariantImageChange}
                             className="overflow-hidden"
                             id="image"
                             name="image"
                             type="file"
                             accept="image/*"
                           />
                         </div>
                       </div>
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="image"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         ></label>
                         <div className="mt-2">
                           <div>
                             {selectedVariantImage && (
                               <img
                                 style={{ width: "50px", height: "50px" }}
                                 src={selectedVariantImage}
                               />
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="mt-5 grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-6">
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="productSize"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Product Size
                         </label>
                         <div className="mt-2">
                           <select
                             name="productSize"
                             id="productSize"
                             className="block w-full capitalize  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           >
                             <option disabled selected value="">
                               -- select size ---
                             </option>
                             <optgroup label="Clothing Size">
                               <option>XS</option>
                               <option>S</option>
                               <option>M</option>
                               <option>L</option>
                               <option>XL</option>
                             </optgroup>

                             {/* Shoe Sizes */}
                             <optgroup label="Shoe Size">
                               <option>US 6</option>
                               <option>US 7</option>
                               <option>US 8</option>
                               <option>US 9</option>
                               <option>US 10</option>
                             </optgroup>

                             {/* Computer Sizes */}
                             <optgroup label="Computer Size">
                               <option>ATX</option>
                               <option>M-ATX</option>
                               <option>Mini-ITX</option>
                               <option>Laptop 13"</option>
                               <option>Laptop 15"</option>
                             </optgroup>
                             <optgroup label="Mobile Phone Size">
                               <option>4.7-inch</option>
                               <option>5.5-inch</option>
                               <option>6.1-inch</option>
                               <option>6.7-inch</option>
                               <option>6.9-inch</option>
                             </optgroup>
                           </select>
                         </div>
                       </div>
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="product-color"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Product Color
                         </label>
                         <div className="mt-2 flex justify-between">
                           <select
                             onChange={(e) => setHasColor(e.target.value)}
                             name="color"
                             id="product-color"
                             className="block capitalize w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           >
                             <option selected value="no">
                               No
                             </option>
                             <option value="yes">Yes</option>
                           </select>

                           {hasColor === "yes" && (
                             <div>
                               <div style={styles.swatch} onClick={handleClick}>
                                 <div style={styles.color} />
                               </div>
                               {displayColorPicker && (
                                 <div style={styles.popover}>
                                   <div
                                     style={styles.cover}
                                     onClick={handleClose}
                                   />
                                   <SketchPicker
                                     color={color}
                                     onChange={handleChange}
                                   />
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                       </div>

                       <div className="sm:col-span-1">
                         <label
                           htmlFor="product-oldprice"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Product Old price
                         </label>
                         <div className="mt-2">
                           <input
                             placeholder="Product old price"
                             type="number"
                             required
                             name="oldPrice"
                             id="product-oldprice"
                             autoComplete=""
                             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           />
                         </div>
                       </div>
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="productPrice"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Current Price
                         </label>
                         <div className="mt-2">
                           <input
                             placeholder="Current price"
                             type="number"
                             required
                             name="productPrice"
                             id="productPrice"
                             autoComplete=""
                             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           />
                         </div>
                       </div>
                       <div className="sm:col-span-1">
                         <label
                           htmlFor="stock"
                           className="block text-sm font-medium leading-6 text-gray-900"
                         >
                           Product Stock
                         </label>
                         <div className="mt-2">
                           <input
                             placeholder="Product stock"
                             type="number"
                             required
                             name="stock"
                             id="stock"
                             autoComplete=""
                             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           />
                         </div>
                       </div>

                       <div className="sm:col-span-1">
                         <label
                           htmlFor=""
                           className="block text-sm font-medium leading-6 text-gray-900 text-center"
                         >
                           Action
                         </label>
                         <button
                           type="submit"
                           className="block w-1/2 rounded-md border-0 py-1.5 text-white bg-green-500 sm:text-sm sm:leading-6 mt-2 mx-auto"
                         >
                           +
                         </button>
                       </div>
                     </div>
                   </form>
                   {variants?.length > 0 && (
                     <div className="variant-preview mt-10">
                       <table className="min-w-full">
                         <thead>
                           <tr className="bg-gray-50 border-b border-gray-200 text-xs leading-4 text-gray-500 uppercase tracking-wider">
                             <th className="px-6 py-3 text-left font-medium">
                               Image
                             </th>
                             <th className="px-6 py-3 text-left font-medium">
                               Size
                             </th>
                             <th className="px-6 py-3 text-left font-medium">
                               Color
                             </th>
                             <th className="px-6 py-3 text-left font-medium">
                               Old Price
                             </th>
                             <th className="px-6 py-3 text-left font-medium">
                               Current Price
                             </th>
                             <th className="px-6 py-3 text-left font-medium">
                               Stock
                             </th>
                           </tr>
                         </thead>
                         <tbody className="bg-white">
                           {variants?.map((variant, index) => {
                             console.log(variant);
                             return (
                               <tr key={index}>
                                 <td className="px-4 py-4 whitespace-no-wrap border-b border-gray-200">
                                   <img
                                     className="w-14 h-14"
                                     src={variant?.image}
                                   />
                                 </td>
                                 <td className="px-4 py-4 whitespace-no-wrap border-b border-gray-200">
                                   <span
                                     className={`inline-flex px-2 text-xs font-medium leading-5 rounded-full dark:bg-green-800 dark:text-green-100`}
                                   >
                                     {variant?.size}
                                   </span>
                                 </td>
                                 <td className="px-4 py-4 whitespace-no-wrap border-b border-gray-200">
                                   <div className="text-sm leading-5 text-gray-900">
                                     <div style={styles.swatch}>
                                       <div
                                         style={{
                                           background: `rgba(${variant.color.r}, ${variant.color.g}, ${variant.color.b}, ${variant.color.a})`,
                                           width: "36px",
                                           height: "14px",
                                           borderRadius: "2px",
                                         }}
                                       />
                                     </div>
                                   </div>
                                 </td>
                                 <td
                                   style={{ minWidth: "130px" }}
                                   className="px-4 py-4 whitespace-no-wrap border-b border-gray-200"
                                 >
                                   <div className="text-sm leading-5 text-gray-900">
                                     {variant?.oldPrice}
                                   </div>
                                 </td>
                                 <td className="px-4 py-4 whitespace-no-wrap border-b border-gray-200">
                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                     {variant?.price}
                                   </span>
                                 </td>
                                 <td className="px-4 py-4 whitespace-no-wrap border-b border-gray-200">
                                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                     {variant?.stock}
                                   </span>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   )}
                 </div>
               </div>
             </div>

             <div className="mt-6 flex items-center justify-center gap-x-6">
               <button
                 onClick={() => navigate("/products")}
                 type="button"
                 className="rounded-md bg-white border border-gray-400 hover:border-red-400 px-3 py-2 text-sm font-semibold text-gray-500 shadow-sm hover:bg-red-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition duration-500 ease-in-out"
               >
                 Cancel
               </button>
               <button
                 onClick={handleCreateNewProduct}
                 type="submit"
                 className="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-500 ease-in-out"
               >
                 Create{" "}
               </button>
             </div>
           </div>
         </main>
       </div>
       {showModal && (
         <div
           id="popup-modal"
           className="fixed  top-0 left-0 right-0 bottom-0 flex items-center  justify-center"
         >
           <div className="relative lg:left-28">
             <div className="relative bg-[#2a2a47] rounded-lg  shadow dark:bg-gray-700">
               <button
                 type="button"
                 className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                 data-modal-hide="popup-modal"
               >
                 <svg
                   aria-hidden="true"
                   className="w-5 h-5"
                   fill="currentColor"
                   viewBox="0 0 20 20"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     fillRule="evenodd"
                     d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                     clipRule="evenodd"
                   ></path>
                 </svg>
                 <span className="sr-only">Close modal</span>
               </button>
               <div className="p-6 text-center">
                 <h4 className="text-white mb-3">Select Image Size</h4>
                 <div className="mb-4">
                   <Cropper
                     src={croppedImage}
                     style={{ maxHeight: "50%", maxWidth: "50%" }}
                     aspectRatio={1}
                     guides={true}
                     zoomable={false}
                     autoCropArea={1}
                     viewMode={1}
                     ref={cropperRef}
                   />
                 </div>

                 <button
                   onClick={handleCloseModal}
                   type="button"
                   className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                   data-modal-hide="popup-modal"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleConfirmCrop}
                   type="button"
                   className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                   data-modal-hide="popup-modal"
                 >
                   Select
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

 export default AddNewProduct;
