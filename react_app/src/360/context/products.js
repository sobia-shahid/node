// products context
import React from "react";
import axios from "axios";
import { url } from "../utils/URL";

export const ProductContext = React.createContext();

export default function ProductProvider({ children }) {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [featured, setFeatured] = React.useState([]);
  const [sorted, setSorted] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [realted, setRealted] = React.useState([]);
  const [filters, setFilters] = React.useState({
    search: "",
    category: "all",
    shipping: false,
    price: "all",
    city: "all",
  });
  const cat = filters.category;

  const [counter, setcounter] = React.useState([]);
  const [likes, setLikes] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    axios.get(`/api/places`).then((response) => {
      setSorted(response.data);
      setProducts(response.data);
      setLoading(false);
    });
    axios.get(`/api/counter/`).then((res) => {
      setcounter(res.data);
    });
    axios.get(`/api/like`).then((res) => {
      setLikes(res.data);
    });
    return () => {};
  }, []);

  React.useEffect(() => {
    let newpr = [...products];
    const { search, category, shipping, price, city } = filters;
    if (category !== "all") {
      newpr = newpr.filter((item) => item.category === category);
    }
    if (city !== "all") {
      newpr = newpr.filter((item) => item.city === city);
    }
    if (shipping !== false) {
      newpr = newpr.filter((item) => item.featured === true);
    }
    if (search !== "") {
      newpr = newpr.filter((item) => {
        let title = item.title.toLowerCase().trim();
        console.log(title);
        return title.includes(search) ? item : null;
      });
    }
    setSorted(newpr);
  }, [filters, products]);
  
  const updateLikes = (userId, id, inc = true ) => {
    if (inc) {
      console.log('user id =>', userId);
      axios
        .put(`/api/like/${id}/increment`, { userId: userId })
        .then((res) => {
          if (res.status == 200) {
            const { count, _id, users } = res.data;
            const newLikes = [...likes];
            const index = newLikes.findIndex(it =>it._id === _id);
            if (index > -1) {
              newLikes[index] = res.data;
              setLikes(newLikes);
            }  
          }
        })    
    } else {
      axios
      .put(`/api/like/${id}/decrement`, { userId: userId })
      .then((res) => {
        if (res.status == 200) {
          const { count, _id, users } = res.data;
          const newLikes = [...likes];
          const index = newLikes.findIndex(it =>it._id === _id);
          if (index > -1) {
            newLikes[index] = res.data;
            setLikes(newLikes);
          }  
        }
      })
    }
  }

  const changePage = (index) => {};
  const updateFilter = (e) => {
    const type = e.target.type;
    const filter = e.target.name;
    const value = e.target.value;
    // the most important thing to know the filter name, and value in order to do our filters.
    let filterValue;
    if (type === "checkbox") {
      filterValue = e.target.checked; // ture, or false
    } else if (type === "radio") {
      value === "all"
        ? (filterValue = value)
        : (filterValue = parseInt(value.split("").join("")));
    } else {
      filterValue = value;
    }
    setFilters({ ...filters, [filter]: filterValue });
  };

  return (
    <div>
      <ProductContext.Provider
        value={{
          products,
          counter,
          likes,
          loading,
          featured,
          sorted,
          page,
          filters,
          updateLikes,
          changePage,
          updateFilter,
          realted,
        }}
      >
        {children}
      </ProductContext.Provider>
    </div>
  );
}
