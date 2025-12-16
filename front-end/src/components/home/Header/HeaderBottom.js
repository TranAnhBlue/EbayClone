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
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* TOP BAR - Giống eBay */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-xs">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Hi,</span>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {userName || "User"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Hi!</span>
                  <Link to="/signin" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                  <span className="text-gray-600">or</span>
                  <Link to="/signup" className="text-blue-600 hover:underline">
                    register
                  </Link>
                </div>
              )}

              <Link
                to="/deals"
                className="text-gray-700 hover:text-blue-600 hover:underline"
              >
                Daily Deals
              </Link>

              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 hover:underline hidden md:block"
              >
                Brand Outlet
              </Link>

              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 hover:underline hidden md:block"
              >
                Help & Contact
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-700 hidden md:flex">
                <span>Ship to</span>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <span className="font-semibold">Vietnam</span>
                  <FaChevronDown className="text-xs" />
                </button>
              </div>

              {isAuthenticated && user?.role === "buyer" && (
                <Link
                  to="/store-registration"
                  className="text-gray-700 hover:text-blue-600 hover:underline"
                >
                  Sell
                </Link>
              )}

              {isAuthenticated && user?.role === "seller" && (
                <Link
                  to="/overview"
                  className="text-gray-700 hover:text-blue-600 hover:underline"
                >
                  Seller Hub
                </Link>
              )}

              <Link
                to="/watchlist"
                className="text-gray-700 hover:text-blue-600 hover:underline hidden md:block"
              >
                Watchlist
              </Link>

              <Link
                to="/order-history"
                className="text-gray-700 hover:text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>My eBay</span>
                <FaChevronDown className="text-xs" />
              </Link>

              {/* Notifications */}
              {isAuthenticated && (
                <button className="relative text-gray-700 hover:text-blue-600">
                  <FiBell className="text-base" />
                  {chatNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {chatNotifications}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER - Logo + Search + Icons */}
      <div className="bg-white w-full">
        <div className="w-full px-10">
          <div className="flex items-center justify-between py-4 w-full">
            {/* LEFT: Logo + Shop by category */}
            <div className="flex items-center gap-8 flex-shrink-0">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img
                  src={logoImg}
                  alt="Shop Logo"
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </Link>

              {/* Shop by category */}
              <div ref={categoryRef} className="relative">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium text-sm"
                >
                  <span>Shop by category</span>
                  <FaChevronDown className="text-xs" />
                </button>

                {showCategories && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={cat.link}
                        onClick={() => setShowCategories(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* CENTER: Search (ăn hết phần còn lại) */}
            <div className="flex-1 mx-16 max-w-[900px] relative">
              <div className="flex border-2 border-gray-900 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search for anything"
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                />

                <div className="border-l-2 border-gray-900" />

                <button className="px-3 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <span className="hidden md:inline text-gray-700">
                    All Categories
                  </span>
                  <FaChevronDown className="text-xs text-gray-600" />
                </button>

                <button className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2">
                  <FaSearch />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>

              {/* Search Results giữ nguyên */}
              {searchQuery && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full mt-2 max-h-96 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-y-auto z-50"
                >
                  {filteredProducts.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        navigate(`/product/${item._id}`, { state: { item } });
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b"
                    >
                      <img
                        src={getProductImage(item)}
                        className="w-14 h-14 object-contain"
                        alt={item.name}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Right Icons - Chat, Account, Cart */}
            <div className="flex items-center gap-3">
              {/* Chat */}
              {isAuthenticated && (
                <Link
                  to="/chat"
                  className="relative flex flex-col items-center hover:text-blue-600 transition-colors group"
                >
                  <FiMessageSquare className="text-xl" />
                  {chatNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {chatNotifications}
                    </span>
                  )}
                  <span className="text-xs mt-0.5">Messages</span>
                </Link>
              )}

              {/* Account Dropdown */}
              <div
                ref={ref}
                onClick={() => setShowUser(!showUser)}
                className="relative cursor-pointer"
              >
                <div className="flex flex-col items-center hover:text-blue-600 transition-colors">
                  <FiUser className="text-xl" />
                  <span className="text-xs mt-0.5">Account</span>
                </div>

                {showUser && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        {userName && (
                          <div className="px-4 py-2 border-b border-gray-200 font-medium text-gray-900">
                            Hi, {userName}
                          </div>
                        )}
                        <Link
                          to="/order-history"
                          onClick={() => setShowUser(false)}
                        >
                          <div className="px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                            <MdOutlineHistory />
                            Purchase History
                          </div>
                        </Link>
                        <Link to="/profile" onClick={() => setShowUser(false)}>
                          <div className="px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                            <RiUserSettingsLine />
                            Account Settings
                          </div>
                        </Link>
                        <Link to="/address" onClick={() => setShowUser(false)}>
                          <div className="px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700">
                            <RiHomeSmileLine />
                            Addresses
                          </div>
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <div
                          onClick={handleLogout}
                          className="px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 cursor-pointer"
                        >
                          <FiLogOut />
                          Sign out
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/signin" onClick={() => setShowUser(false)}>
                          <div className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded mx-2 mb-2">
                            Sign in
                          </div>
                        </Link>
                        <div className="px-4 py-2 text-xs text-gray-600 text-center">
                          New user?{" "}
                          <Link
                            to="/signup"
                            className="text-blue-600 hover:underline"
                          >
                            Sign up
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                className="relative flex flex-col items-center hover:text-blue-600 transition-colors"
              >
                <div className="relative">
                  <FiShoppingBag className="text-xl" />
                  {cartTotalCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartTotalCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION - Categories */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-6 py-2.5 text-sm overflow-x-auto">
            {/* Shop by Category Dropdown */}
            <div ref={categoryRef} className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
              >
                <span>Shop by category</span>
                <FaChevronDown className="text-xs" />
              </button>

              {showCategories && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={cat.link}
                      onClick={() => setShowCategories(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
