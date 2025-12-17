import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import {
  FiUser,
  FiShoppingBag,
  FiMessageSquare,
  FiLogOut,
  FiBell,
} from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import {
  MdOutlineHistory,
  MdOutlineRateReview,
  MdFavoriteBorder,
} from "react-icons/md";
import { RiUserSettingsLine, RiHomeSmileLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import logoImg from "../../../assets/images/shopiiLogo.png";
import {
  resetUserInfo,
  setUserInfo,
  setProducts,
} from "../../../redux/orebiSlice";

const HeaderBottom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ref = useRef();
  const categoryRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef(null);
  const banners = [
    {
      title: "Snap. Work. Play.",
      desc: "Find the electronics that fit your lifestyle.",
      bg: "bg-blue-600",
    },
    {
      title: "Tech for Everyday Life",
      desc: "Upgrade your home and office today.",
      bg: "bg-indigo-600",
    },
    {
      title: "Entertainment Starts Here",
      desc: "Audio, video & gaming deals.",
      bg: "bg-purple-600",
    },
  ];
  const bannerCategories = [
    [
      {
        name: "Electronics",
        image:
          "https://m.media-amazon.com/images/I/61Hg040ZMuL._AC_SL1000_.jpg",
        link: "/shop?category=electronics",
      },
      {
        name: "Motors",
        image:
          "https://engineeringlearn.com/wp-content/uploads/2021/03/Types-of-Motors-And-their-use.jpg",
        link: "/shop?category=motors",
      },
    ],
    [
      {
        name: "Fashion",
        image:
          "https://snworksceo.imgix.net/tdg/636ccc86-b862-4883-a6e9-76a27e8cd775.sized-1000x1000.jpg?w=800",
        link: "/shop?category=fashion",
      },
      {
        name: "Health & Beauty",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcQfsHssWFh-HM61OsHeuob7SWzPWw3R_lGQ&s",
        link: "/shop?category=beauty",
      },
    ],
    [
      {
        name: "Sports",
        image:
          "https://i.etsystatic.com/25460158/r/il/41f3b0/3696258950/il_fullxfull.3696258950_9403.jpg",
        link: "/shop?category=sports",
      },
      {
        name: "Toys",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwnlEXSAeog0oKHISZROAb45BIdDaFSAlAZA&s",
        link: "/shop?category=toys",
      },
    ],
  ];
  const futureCategories = [
  { name: "Laptops", img: "https://shopcongnghe.com.vn/wp-content/uploads/1-8.jpg", link: "/shop?category=laptops" },
  { name: "Smartphones", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4sebu-tvh1qVtlmapfT5RZRCgSbQu3GlE1w&s", link: "/shop?category=phones" },
  { name: "Tablets", img: "https://i5.walmartimages.com.mx/samsmx/images/product-images/img_large/981040427l.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF", link: "/shop?category=tablets" },
];

const trendingCategories = [
  { name: "Tech", img: "https://www.ucf.edu/wp-content/blogs.dir/20/files/2023/07/Tech-Hub.jpg", link: "/shop?category=electronics" },
  { name: "Motors", img: "https://dolinmachine.com/assets/news/2017_02/electromagnetic-brakes.jpg", link: "/shop?category=motors" },
  { name: "Luxury", img: "https://news.dupontregistry.com/wp-content/uploads/2023/07/rr-main-scaled.jpg", link: "/shop?category=luxury" },
];

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  // Get authentication info from Redux store
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;
  const user = authState?.user || null;

  // Get data from Redux store
  const orebiReducer = useSelector((state) => state.orebiReducer) || {};
  const products = orebiReducer.products || [];

  // Get chat unread count
  const chatState = useSelector((state) => state.chat);
  const chatNotifications =
    chatState?.conversations?.reduce(
      (count, conv) => count + (conv.unreadCount || 0),
      0
    ) || 0;

  // Get cart information
  const cartState = useSelector((state) => state.cart) || {};
  const cartItems = cartState.items || [];
  const cartTotalCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [showUser, setShowUser] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";

  // Categories data
  const categories = [
    { id: 1, name: "Electronics", link: "/shop?category=electronics" },
    { id: 2, name: "Fashion", link: "/shop?category=fashion" },
    { id: 3, name: "Home & Garden", link: "/shop?category=home" },
    { id: 4, name: "Sports", link: "/shop?category=sports" },
    { id: 5, name: "Toys", link: "/shop?category=toys" },
    { id: 6, name: "Motors", link: "/shop?category=motors" },
    { id: 7, name: "Collectibles", link: "/shop?category=collectibles" },
    { id: 8, name: "Health & Beauty", link: "/shop?category=beauty" },
  ];

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      const formattedProducts = response.data.data.map((product) => ({
        ...product,
        name: product.title,
        image: product.image,
      }));

      dispatch(setProducts(formattedProducts));
      setAllProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, [API_BASE_URL, dispatch]);

  // Fetch user data function
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserName(response.data.fullname || response.data.username);
      dispatch(setUserInfo(response.data));
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      }
    }
  }, [API_BASE_URL, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    fetchProducts();

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn, fetchProducts, fetchUserData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowUser(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategories(false);
      }
    };

    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const filtered = allProducts
      .filter(
        (item) =>
          (item.title &&
            item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.name &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((item) => ({
        _id: item._id,
        image: item.image,
        name: item.name || item.title || "Untitled Product",
        price: item.price,
        description: item.description,
        category: item.categoryId?.name || "",
        seller: item.sellerId?.username || "",
      }));

    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${API_BASE_URL}/api/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("accessToken");
      dispatch(resetUserInfo());
      setIsLoggedIn(false);
      setUserName(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUserName(null);
      navigate("/signin");
    }
  };

  const getProductImage = (item) => {
    if (!item.image) {
      return "https://via.placeholder.com/100?text=No+Image";
    }

    if (item.image.startsWith("http://") || item.image.startsWith("https://")) {
      return item.image;
    } else {
      return `${API_BASE_URL}/uploads/${item.image}`;
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP BAR - Giống eBay */}
      
      {/* ===== HOME BANNER (ADDED - NO CHANGE TO EXISTING CODE) ===== */}
      <div className="w-full bg-white">
        {/* BLUE BANNER */}
        <div className="max-w-[1600px] mx-auto px-6 mt-6">
          <div
            className={`${banners[currentSlide].bg} rounded-2xl px-12 py-14 flex items-center justify-between relative overflow-hidden transition-all duration-500`}
          >
            {/* LEFT */}
            <div className="max-w-md text-white">
              <h1 className="text-4xl font-bold mb-3">
                {banners[currentSlide].title}
              </h1>
              <p className="text-lg mb-6">{banners[currentSlide].desc}</p>

              <Link
                to="/shop"
                className="inline-block bg-white text-black font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition"
              >
                Shop now
              </Link>
            </div>

            {/* RIGHT */}
            {/* RIGHT - CATEGORIES (2 per slide) */}
            <div className="hidden lg:flex items-center gap-16">
              {bannerCategories[currentSlide].map((cat) => (
                <div key={cat.name} className="text-center text-black">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-40 mx-auto mb-3"
                  />
                  <Link to={cat.link} className="font-semibold hover:underline">
                    {cat.name} ›
                  </Link>
                </div>
              ))}
            </div>

            {/* CONTROLS */}
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + banners.length) % banners.length
                  )
                }
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100"
              >
                ‹
              </button>

              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % banners.length)
                }
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100"
              >
                ›
              </button>

              <button
                onClick={() => {
                  if (slideIntervalRef.current) return;

                  slideIntervalRef.current = setInterval(() => {
                    setCurrentSlide((prev) => (prev + 1) % banners.length);
                  }, 3000);
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100"
              >
                ▶
              </button>
            </div>

            {/* DOTS */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition ${
                    currentSlide === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* WHITE STRIP */}
        <div className="max-w-[1600px] mx-auto px-6 mt-6">
          <div className="bg-gray-100 rounded-xl px-10 py-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Shopping made easy</h2>
              <p className="text-gray-600">
                Enjoy reliability, secure deliveries and hassle-free returns.
              </p>
            </div>

            <Link
              to="/shop"
              className="bg-black text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition"
            >
              Start now
            </Link>
          </div>
        </div>

        {/* ===== CATEGORY SHOWCASE ===== */}
        {/* ===== THE FUTURE IN YOUR HANDS ===== */}
<div className="max-w-[1600px] mx-auto px-6 mt-16">
  <h2 className="text-2xl font-bold mb-6">The future in your hands</h2>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
    {futureCategories.map((item) => (
      <Link
        key={item.name}
        to={item.link}
        className="text-center group"
      >
        <div className="w-44 h-44 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
          <img src={item.img} alt={item.name} className="h-24" />
        </div>
        <p className="font-medium">{item.name}</p>
      </Link>
    ))}
  </div>
</div>

{/* ===== TRENDING ON EBAY ===== */}
<div className="max-w-[1600px] mx-auto px-6 mt-20">
  <h2 className="text-2xl font-bold mb-6">Trending on eBay</h2>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
    {trendingCategories.map((item) => (
      <Link
        key={item.name}
        to={item.link}
        className="text-center group"
      >
        <div className="w-44 h-44 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition">
          <img src={item.img} alt={item.name} className="h-24" />
        </div>
        <p className="font-medium">{item.name}</p>
      </Link>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default HeaderBottom;
