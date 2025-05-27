import { Brain, Check, Grid, Loader2, Plus, RefreshCw, Upload } from "lucide-react"
import { useEffect, useState, useRef } from "react"; // Add useRef
import apiService from "../../../utilities/service/api";
import Tooltip from "../../ui/tooltip";
import { Button } from "../../ui/button";
import ImageGenerator from "../../ui/ImageGenerator";
import toast from "react-hot-toast"; // Make sure this is imported

interface ImageGalleryProps {
    onImageSelect: (imageUrl: string) => void;
    isEditorContext?: boolean;
    courseId?: string | number;
    contentType?: string;
    onCoverImageGenerated?: (imageUrl: string) => void;
    handleImageGenerator?: () => void;
}

interface GalleryImage {
    key: string;
    url: string;
}
  

const ImageGallery: React.FC<ImageGalleryProps> = ({contentType,courseId,isEditorContext,onImageSelect,onCoverImageGenerated,handleImageGenerator}) => {
    const [error,setError] = useState('');
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [galleryImages,setGalleryImages] = useState([]);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false); // Add state for upload tracking
    const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for file input
    
    useEffect(()=>{
        fetchPreviousImages();
    },[])

    const fetchPreviousImages = async () => {
        if (!contentType || !courseId) {
          setError("Content type or ID not provided");
          return;
        }
    
        try {
          setLoadingGallery(true);
          const response = await apiService.get(
            `/images/${contentType}/${courseId}`
          );
    
          if (response?.success && Array.isArray(response?.data)) {
            setGalleryImages(response.data); // response.data is now an array of { key, url }
          } else {
            setGalleryImages([]);
          }
        } catch (err) {
          console.error("Failed to fetch images:", err);
          setError("Failed to load previous images");
        } finally {
          setLoadingGallery(false);
        }
    };

    const selectGalleryImage = (image: GalleryImage) => {
        setSelectedGalleryImage(image.url)
    };
    const handleInsertImage = () => {
        console.log(selectedGalleryImage)
     if (selectedGalleryImage) {
        onImageSelect(selectedGalleryImage);
    }
    };
    const uploadToMedia = () => {
        // Trigger the hidden file input click
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        // Validate file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        
        try {
            setUploading(true);
            
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);
            formData.append('contentType', contentType || 'course');
            formData.append('contentId', courseId?.toString() || '');
            formData.append('description', `User uploaded: ${file.name}`);
            
            // Use apiService to make the request
            const response = await apiService.post(
                '/upload-image', 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.success) {
                toast.success('Image uploaded successfully');
                // Refresh the gallery
                await fetchPreviousImages();
                // Select the newly uploaded image if available
                if (response.data?.url) {
                    setSelectedGalleryImage(response.data.url);
                }
            } else {
                toast.error(response.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const addCoverImage = () => {
        console.log(selectedGalleryImage)
        if (selectedGalleryImage) {
            if(typeof(selectedGalleryImage)==='string'){
                //@ts-ignore
                onCoverImageGenerated(selectedGalleryImage||'');
            }
        }
        // onCoverImageGenerated
    }
    // const openImageGenerator = () =>{
    //   return(<ImageGenerator 
    //     contentType={contentType}
    //     courseId={courseId}
    //     isEditorContext={true}
    //     onImageSelect={onImageSelect}
    //     // onCoverImageGenerated={handleAddCoverImage}
    //   />)
    // }
  return (
    <div>
        <div className="flex justify-end gap-2">
            <Button 
                className={`px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 md:text-base text-xs ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                onClick={uploadToMedia}
                disabled={uploading}
            > 
                {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload />
                )}
                {uploading ? 'Uploading...' : 'Upload Image'} 
            </Button>
            <Button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 md:text-base text-xs" 
                onClick={handleImageGenerator}
            > 
                <Brain /> Generate Image 
            </Button>
            
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
         <div className="p-6">
           <div className="mb-4 flex justify-between items-center">
             <h3 className="text-lg font-medium text-gray-700">
               Previously Generated Images
             </h3>
             <button
               onClick={fetchPreviousImages}
               className="p-2 rounded-full hover:bg-purple-50"
               title="Refresh Gallery"
             >
               <RefreshCw
                 className={`w-4 h-4 text-purple-600 ${
                   loadingGallery ? "animate-spin" : ""
                 }`}
               />
             </button>
           </div>
        </div>
           {loadingGallery ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
             </div>
           ) : galleryImages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
               <Grid className="w-12 h-12 mb-3 text-gray-300" />
               <p>No images found. Generate your first image!</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {galleryImages?.map((image:any) => (
                   <div
                     key={image.key}
                     className={`
                       relative rounded-lg overflow-hidden cursor-pointer h-40
                       border-2 ${
                         selectedGalleryImage === image.url
                           ? "border-purple-500"
                           : "border-transparent"
                       } 
                       transition-all hover:shadow-md
                     `}
                     onClick={() => selectGalleryImage(image)}
                   >
                     <img
                       src={image.url}
                       alt="Generated image"
                       className="w-full h-full object-cover"
                       loading="lazy"
                      //  onError={(e) => {
                      //   //  console.error("Image failed to load:", e);
                      //     const target = e.target as HTMLImageElement;
                      //     target.src = '/placeholder-image.png';
                      //  }}

                       onError={(e) => {
    // console.error("Image failed to load:", generatedImage);
    setError("Failed to load generated image. Using proxy...");
    
    // Try with a proxy approach or direct URL
    const imgElement = e.target as HTMLImageElement;
    // Add referrerPolicy and crossOrigin attributes
    imgElement.referrerPolicy = "no-referrer";
    imgElement.crossOrigin = "anonymous";
    
    // Try the direct URL approach
    if (!imgElement.src.includes('?direct=true')) {
      imgElement.src = `${image.url}?direct=true`;
    }
  }}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
                     />
                     {selectedGalleryImage === image.url && (
                       <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     )}
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                       <Tooltip content={image.key} width="medium">
                         <p className="text-white text-xs truncate">
                           {image.key}
                         </p>
                       </Tooltip>
                     </div>
                   </div>
                 ))}
               </div>

               {isEditorContext && selectedGalleryImage && (
                 <div className="mt-4 flex justify-between">
                    <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                        onClick={addCoverImage}
                    >
                     <Plus className="w-4 h-4" />
                     Add Cover
                    </button>
                   <button
                     onClick={handleInsertImage}
                     className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                   >
                     <Plus className="w-4 h-4" />
                     Insert
                   </button>
                 </div>
               )}
             </>
           )}
    </div>
  )
}

export default ImageGallery