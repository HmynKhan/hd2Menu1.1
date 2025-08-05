/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text  } from "react-konva";
import { IoMdAdd } from "react-icons/io";
import CustomLayout from "../CustomLayout/CustomLayout";
import { IoCloseSharp } from "react-icons/io5";
import PopUpMessage from "../PopUpMessage";
import Login from "../Timeline/Login";
import { Menu, MenuItem, ListItemIcon, Typography, IconButton } from "@mui/material";
import ConfirmationModal from "../ConfiramtionModal/confirmation_modal";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { PiDotsThreeCircle } from "react-icons/pi";


const SaveLayout = ({
  layouts,
  onDeleteLayout,
  onLoadLayout,
  currentLayoutIndex,
  setLayouts,
  onCancle,
}) => {
  // Step 1: Add state to control the modal visibility
  const [isCustomLayoutOpen, setIsCustomLayoutOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null); // Store layout being edited
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showLogin, setShowLogin] = useState(false);

  // for menu three dot
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteId, setDeleteId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleMenuOpen = (event, layout) => {
  setAnchorEl(event.currentTarget);
  setCurrentItem(layout);
};

const handleMenuClose = () => {
  setAnchorEl(null);
  setCurrentItem(null);
};


  // i want to change for vertical 2nd time
  const fetchLayouts = async () => {
    try {
      const response = await fetch("https://dev.app.hd2.menu/api/user-layouts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Use Bearer token
        },
      });
                  if (!response.ok) {
        throw new Error("Failed to fetch layouts");
      }
      const data = await response.json();

      const formattedLayouts = data.data.map((layout) => ({
        id: layout.id,
        name: layout.name,
        width: layout.width,
        height: layout.height,
        orientation: layout.layout, 
divisions: JSON.parse(layout.divisions || "[]"),

      }));
      

      setLayouts(formattedLayouts);
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };


  // const handleEditLayout = async (layoutId) => {
  //   try {
  //     const response = await fetch(`https://dev.app.hd2.menu/api/edit-layout-value/${layoutId}`);
      
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch layout details");
  //     }
  
  //     const data = await response.json();
  //     setEditingLayout({
  //       ...data.data, 
  //       divisions: JSON.parse(data.data.divisions || "[]") 
  //     });
            
  //     setIsCustomLayoutOpen(true); // Open CustomLayout modal
  //   } catch (error) {
  //     console.error("Error fetching layout for editing:", error);
  //   }
  // };
  

  // Function to handle opening the custom layout modal
  
  const handleEditLayout = async (layoutId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      setMessage({ text: "Please login first.", type: "error" });
      return;
    }
  
    try {
      const response = await fetch(`https://dev.app.hd2.menu/api/edit-layout-value/${layoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch layout details");
      }
  
      const data = await response.json();
      setEditingLayout({
        ...data.data, 
        divisions: JSON.parse(data.data.divisions || "[]"),
      });
  
      setIsCustomLayoutOpen(true); // Open CustomLayout modal
    } catch (error) {
      console.error("Error fetching layout for editing:", error);
      setMessage({ text: "Failed to fetch layout. Please try again.", type: "error" });
    }
  };
  
  
  const handleAddCustomLayout = () => {
    setIsCustomLayoutOpen(true); // Open the modal
  };

  const handleSaveNewLayout = async (newLayout) => {
    // Swap the width/height and x/y for vertical orientation before saving
    const updatedDivisions = newLayout.divisions.map((division) => {
      if (newLayout.orientation === "vertical") {
        return {
          ...division,
          x: division.y, // Swap x and y
          y: division.x,
          width: division.height, // Swap width and height
          height: division.width,
        };
      }
      return division; // Keep as is for horizontal orientation
    });

    const updatedLayout = {
      ...newLayout,
      divisions: updatedDivisions, // Use the updated divisions
    };

    const updatedLayouts = [updatedLayout, ...layouts];
    setLayouts(updatedLayouts);
    setIsCustomLayoutOpen(false); 

    setMessage({ text: "Layout created successfully!", type: "success" });

    await fetchLayouts(); // Fetch updated layouts
  
    setTimeout(() => setMessage({ text: "", type: "" }), 3000); // Hide message after 3 sec

  };


  // Fetch layouts from API
  useEffect(() => {
   

    fetchLayouts();
  }, []);

  // const handleUpdateLayout = async (updatedLayout) => {
  //   if (!updatedLayout || !updatedLayout.id) return;
  
  //   try {
  //     const response = await fetch(`https://dev.app.hd2.menu/api/update-layout-value/${updatedLayout.id}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(updatedLayout),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to update layout");
  //     }
  
  //     const data = await response.json();
  //     console.log("Updated Layout:", data);
      
  //     setEditingLayout(null); // Clear editing state
  //     setIsCustomLayoutOpen(false); // Close modal

  //     setMessage({ text: "Layout updated successfully!", type: "success" });

  //     await fetchLayouts(); // Refresh list after update

  //     setTimeout(() => setMessage({ text: "", type: "" }), 3000); // Hide message after 3 sec

  //   } catch (error) {
  //     console.error("Error updating layout:", error);
  //   }
  // };


  const handleUpdateLayout = async (updatedLayout) => {
    if (!updatedLayout || !updatedLayout.id) return;
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      setMessage({ text: "Please login first.", type: "error" });
      return;
    }
  
    try {
      const response = await fetch(`https://dev.app.hd2.menu/api/update-layout-value/${updatedLayout.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token
        },
        body: JSON.stringify(updatedLayout),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update layout");
      }
  
      const data = await response.json();
      console.log("Updated Layout:", data);
  
      setEditingLayout(null); // Clear editing state
      setIsCustomLayoutOpen(false); // Close modal
  
      setMessage({ text: "Layout updated successfully!", type: "success" });
  
      await fetchLayouts(); // Refresh list after update
  
      setTimeout(() => setMessage({ text: "", type: "" }), 3000); // Hide message after 3 sec
  
    } catch (error) {
      console.error("Error updating layout:", error);
      setMessage({ text: "Failed to update layout. Please try again.", type: "error" });
    }
  };
  
  const handleDelete = async () => {
  if (deleteId) {
    await onDeleteLayout(deleteId);
    setMessage({ text: "Layout deleted successfully!", type: "success" });
    await fetchLayouts();
    setIsModalOpen(false);
    onCancle();
  }
  setIsModalOpen(false);
};



const handleDuplicateLayout = async (layout) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    setMessage({ text: "Please login first.", type: "error" });
    return;
  }

  try {
    // Create properly formatted duplicate
    const duplicatedLayout = {
      name: `${layout.name} (Copy)`,
      stageDimensions: {
        width: layout.width,
        height: layout.height
      },
      orientation: layout.orientation === "portrait" ? "vertical" : "horizontal",
      created_by: Date.now().toString(),
      divisions: layout.divisions.map(division => ({
        x: division.x,
        y: division.y,
        width: division.width,
        height: division.height,
        fill: division.fill,
        id: division.id
      }))
    };

    // Call store-layout API
    const response = await fetch("https://dev.app.hd2.menu/api/store-layout-value", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(duplicatedLayout),
    });

    if (!response.ok) {
      throw new Error("Failed to duplicate layout");
    }

    setMessage({ text: "Layout duplicated successfully!", type: "success" });
    await fetchLayouts();
    
  } catch (error) {
    console.error("Error duplicating layout:", error);
    setMessage({ 
      text: "Failed to duplicate layout. Please try again.", 
      type: "error" 
    });
  }
};

  return (
           
    
    <div className="p-2">
      <div className="border-2 border-gray-200  rounded">
    
        <div className="flex justify-between items-center mb-4 p-3"  style={{backgroundColor : '#f3f3f3'}}>
          <h2 className="text-1xl font-bold">Saved Layouts</h2>

    <div style={{display: 'flex', justifyContent: 'flex-end', width: '90%' , gap:'6px'}}>

    <button
            className="px-1 py-1 text-white bg-blue-500 hover:bg-blue-700 cursor-pointer rounded flex items-center gap-1"
            onClick={handleAddCustomLayout}
            style={{fontSize:'10px'}}
          >
            <IoMdAdd size={16} /> Add Custom Layout
          </button>
          <button
                      style={{fontSize:'10px'}}

  className="px-1 py-1 text-white bg-green-500 hover:bg-green-700 cursor-pointer rounded flex items-center gap-2"
  onClick={() => setShowLogin(true)} // Trigger login modal
>
  User Login
</button>

    </div>
        </div>
        {layouts?.length === 0 ? (
          <p>No layouts saved yet.</p>
        ) : (
          <div className="flex  overflow-x-auto" style={{ whiteSpace: "nowrap" }}>
      
{layouts?.map((layout, layoutIndex) => {
  {/* const scaleFactor = layout.width / 84; // Keep this for scaling divisions */}

  let miniWidth = 85;
  let miniHeight = 48; // Fixed height for consistency

  // For portrait/vertical layouts, swap the dimensions to make it narrower and taller
  // but keep it within reasonable bounds
  if (layout.orientation === "portrait" || layout.orientation === "vertical") {
    miniWidth = 55;  // Make it narrower
    miniHeight = 90; // Make it a bit taller, but not too much
  }

  console.log(miniHeight,'miniHeight')

  const isLoaded = layoutIndex === currentLayoutIndex;

const menu = (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>

    {/* Edit */}
    <MenuItem
      onClick={() => {
        setCurrentItem(currentItem);
        handleEditLayout(currentItem?.id);
        handleMenuClose();
      }}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(33, 150, 243, 0.1)', // light blue
          '& .MuiListItemIcon-root, & .MuiTypography-root': {
            color: '#2196f3' // blue
          }
        }
      }}
    >
      <ListItemIcon>
        <MdOutlineEdit />
      </ListItemIcon>
      <Typography style={{ fontSize: '10px' }}>Edit</Typography>
    </MenuItem>

    {/* Duplicate */}
    <MenuItem
      onClick={() => {
        handleDuplicateLayout(currentItem);
        handleMenuClose();
      }}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(76, 175, 80, 0.1)', // light green
          '& .MuiListItemIcon-root, & .MuiTypography-root': {
            color: '#4caf50' // green
          }
        }
      }}
    >
      <ListItemIcon>
        <IoDuplicate />
      </ListItemIcon>
      <Typography style={{ fontSize: '10px' }}>Duplicate</Typography>
    </MenuItem>

    {/* Delete */}
    <MenuItem
      onClick={() => {
        handleMenuClose();
        setDeleteId(currentItem?.id);
        setIsModalOpen(true);
      }}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          '& .MuiListItemIcon-root, & .MuiTypography-root': {
            color: '#f44336'
          }
        }
      }}
    >
      <ListItemIcon>
        <RiDeleteBin6Line />
      </ListItemIcon>
      <Typography style={{ fontSize: '10px' }}>Delete</Typography>
    </MenuItem>

  </Menu>
);



  return (
<div
  key={layoutIndex}
  style={{ marginLeft: '10px' }}
className={`border-2 rounded my-1 pt-0 pr-1 pb-1 pl-1 ${
    isLoaded
      ? "border-4 border-blue-500 "
      : "border-gray-400"
  }`}
>

      {menu}
      <ConfirmationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Layout"
        message="Are you sure you want to delete this layout? This action cannot be undone."
      />

      <div onClick={() => onLoadLayout(layoutIndex)} className="cursor-pointer" >
        

        <div  style={{display:'flex', justifyContent : 'space-between', alignItems:'center' }}>
          <h6 style={{fontSize : '10px', fontWeight: '500' }}>{layout.name}</h6>
         
            <IconButton  onClick={(e) => handleMenuOpen(e, layout)}>
              <PiDotsThreeCircle size={21} />


            </IconButton>
        </div>
         


        <div
          className="border border-gray-400 relative"
          style={{ width: miniWidth+5, height: miniHeight+3,  padding: '0', margin: '0'   }}
        >
          <Stage width={miniWidth+1} height={miniHeight+0} style={{backgroundColor:'#eeeeee',  padding: '0', margin: '0'  }}>
            <Layer>
              {(layout.divisions || []).map((division, index) => {
                // Calculate proper scale factor based on the actual layout dimensions vs mini preview
                const scaleFactorX = miniWidth / layout.width;
                const scaleFactorY = miniHeight / layout.height;
                
                const scaledX = division.x * scaleFactorX;
                const scaledY = division.y * scaleFactorY;
                const scaledWidth = division.width * scaleFactorX;
                const scaledHeight = division.height * scaleFactorY;

                // Adjust positions if divisions go out of bounds
                const x = Math.max(0, Math.min(scaledX, miniWidth - scaledWidth));
                const y = Math.max(0, Math.min(scaledY, miniHeight - scaledHeight));
                console.log("mnm",division)
                return (
                  <>
                    <Rect
                      key={index}
                      x={x}
                      y={y}
                      width={scaledWidth}
                      height={scaledHeight}
                      fill={division.fill}
                      stroke="white"
                      text={`${division?.id}`}
                      strokeWidth={1} 
                    />
                    <Text
                      x={x+2}
                      y={y+2}
                      text={`${division?.id.replace("rect-", "")}`}
                      fontSize={7}
                      fill="black"
                      width={scaledWidth}
                      height={scaledHeight} 
                    />
                  </>
                );
              })}
            </Layer>
          </Stage>
        </div>
   

      </div>
  
    </div>
  );
})}
          </div>
        )}
      </div>

      {/* Step 3: Conditionally render the CustomLayout component in a pop-up/modal */}
      {isCustomLayoutOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-3xl w-full max-h-[95vh] overflow-auto relative">
            <button
              className="absolute top-2 right-2 bg-transparent-500 text-black hover:text-red-600 px-4 py-2 rounded-2xl"
              onClick={() => setIsCustomLayoutOpen(false)}
            >
              <IoCloseSharp className="text-3xl" />
            </button>
            {/* i want to change for device orientation */}
            <CustomLayout 
  onSaveLayout={handleSaveNewLayout} 
  editingLayout={editingLayout} 
  onUpdateLayout={handleUpdateLayout} 
  fetchLayouts={fetchLayouts}
/>

          </div>
        </div>
      )}

            {/* Popup Message */}
            {message.text && (
        <PopUpMessage
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ text: "", type: "" })}
        />
      )}

      {showLogin && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <Login onClose={() => setShowLogin(false)}  />

  </div>
)}


    </div>
  );
};

export default SaveLayout;
