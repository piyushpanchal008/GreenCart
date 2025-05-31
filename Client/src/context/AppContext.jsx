import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";


axios.defaults.withCredentials=true;
axios.defaults.baseURL=import.meta.env.VITE_BACKEND_URL;
export const AppContext = createContext();

export const AppContextProvider=({children})=>{

    const currency=import.meta.env.VITE_CURRENCY;

    const navigate= useNavigate();
    // const [user,setUser]=useState(null)

    const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
});



    const [IsSeller,setIsSeller]=useState(false)
    const [showUserLogin,setShowUserLogin]=useState(false)
    const [products,setProducts]=useState([])
    const [CartItems,setCartItems]=useState({})
    const [searchQuery,setSearchQuery]=useState({})
    


    //fetch seller status
    const fetchSeller=async ()=>{
        try {
            const {data}= await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(data.success)
            }
            else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }
    

    //fetcg user auth,user data and cart items:
    const fetchUser= async ()=>{
        try {
            // const {data}=await axios.get('api/user/is-auth');
            const { data } = await axios.get('/api/user/is-auth', {withCredentials: true});
            if(data.success){
                setUser(data.user);
                setCartItems(data.user.CartItems || {});      
            }
        } catch (error) {
            setUser(null)
        }
    }

    //fetch all product 

    const fetchProducts=async ()=>{
        try {
            const {data}=await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                console.log('API returned failure:', data);
                toast.error(data.message || "Failed to fetch products")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to fetch products")
        }
    }

    //Add product to Cart
    const addToCart=(itemID)=>{
        let cartData=structuredClone(CartItems)

        if(cartData[itemID]){
            cartData[itemID]+=1;
        }
        else{
             cartData[itemID] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to cart")
    }

    
    //update cart item quantity

    const updateCartItem=(itemID,quantity)=>{
        let cartData=structuredClone(CartItems);
        cartData[itemID]=quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }


    //remove product from cart 

    const removeFromCart=(itemID)=>{
        let cartData=structuredClone(CartItems);
        if(cartData[itemID]){
            cartData[itemID]-=1;
            if(cartData[itemID]===0){
               delete cartData[itemID];
            }
        }
        toast.success("Removed from Cart")
        setCartItems(cartData)
    }

    //get cart item count

   const getCartCount=()=>{
    let totalCount=0;
    for(const item in CartItems){
        totalCount+=CartItems[item]
    }
    return totalCount;
   }

   //get cart total amount

   const getCartAmount=()=>{
    let totalAmount=0;
    for(const items in CartItems){
        let itemInfo=products.find((product)=>product._id===items);
        if(CartItems[items]>0){
            totalAmount+=itemInfo.offerPrice * CartItems[items]
        }
    }
    return Math.floor(totalAmount*100)/100;
   }

    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

    //Update Database Cart items :
    useEffect(()=>{
      const updateCart = async ()=>{
        try {
            const {data}= await axios.post('/api/cart/update',{CartItems})
            if (!data.success){
                toast.error(data.message)
                
            } 
        } catch (error) {
            toast.error(error.message)
        }
      }

      if(user && Object.keys(CartItems).length > 0){
        updateCart()
      }
    },[CartItems, user])
    

    const value={navigate,user,setUser, IsSeller,setIsSeller,showUserLogin,setShowUserLogin,products,currency,
        addToCart,updateCartItem,removeFromCart,CartItems,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios,fetchProducts,
    setCartItems,fetchUser}


return <AppContext.Provider value={value}>
    {children}
</AppContext.Provider>
}

export const useAppContext=()=>{
    return useContext(AppContext)
}