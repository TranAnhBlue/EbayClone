import React from 'react';
import { BsSuitHeartFill } from "react-icons/bs";
import { GiReturnArrow } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, addToWishlist } from "../../../redux/orebiSlice";
import ProductService from '../../../services/api/ProductService';

const Product = (props) => {
  const dispatch = useDispatch();
  const _id = props._id;
  const idString = (_id) => {
    return String(_id).toLowerCase().split(" ").join("");
  };
  const rootId = idString(_id);
  const navigate = useNavigate();
  const productItem = props;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        _id: props._id,
        name: props.name,
        quantity: 1,
        images: props.images,
        isDeleted: props.isDeleted,
        price: props.price,
        color: props.inStock?.[0]?.color,
        cost: props.cost,
        inStock: props.inStock,
      })
    )
  }
  const handleWishList = () => {
    dispatch(
      addToWishlist({
        _id: props._id,
        name: props.name,
        quantity: 1,
        images: props.images,
        isDeleted: props.isDeleted,
        price: props.price,
        color: props.inStock?.[0]?.color,
        cost: props.cost,
      })
    )
  };

  const handleProductDetails = () => {
    navigate(`/product/${rootId}`, {
      state: {
        item: productItem,
      },
    });
  };

  return (
    <div className="w-full relative group ebay-product-card">
      <div className="max-w-80 max-h-80 relative overflow-y-hidden ">
        <div onClick={handleProductDetails}>
          <Image className="ebay-product-image" imgSrc={props.images && props.images.length > 0 ? ProductService.getImage(props.images[0].filename) : ''} />
        </div>
        <div className="absolute top-6 left-8">
          {!props.isDeleted && <Badge text="New" />}
        </div>
        <div className="w-full h-32 absolute bg-white -bottom-[130px] group-hover:bottom-0 duration-700">
          <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
            <li className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full">
              Compare
              <span>
                <GiReturnArrow />
              </span>
            </li>
            <li
               onClick={handleAddToCart}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
             Add to cart
              <span>
                <FaShoppingCart />
              </span>
            </li>
            <li
              onClick={handleProductDetails}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              View Details
              <span className="text-lg">
                <MdOutlineLabelImportant />
              </span>
            </li>
            <li
              onClick={handleWishList}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              Add to Wish List
              <span>
                <BsSuitHeartFill />
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-80 py-4 flex flex-col gap-2 border-[1px] border-t-0 px-4">
        <div className="font-titleFont">
          <h2 className="product-title text-base text-gray-800">{props.name}</h2>
          <p className="product-price">${props.price}</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <div>
            <p>Condition: {props.condition || 'New'}</p>
            <p>Seller: {props.storeName || 'Top-rated seller'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Free shipping</p>
            <p className="text-sm text-gray-600">{props.inStock ? 'In stock' : 'Out of stock'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
