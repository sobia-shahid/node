import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Row, Col, Button, Spinner } from "reactstrap";
import BreadCrumbUsers from "../../../components/@vuexy/breadCrumbs/BreadCrumbUsers";
import ProfileHeader from "./ProfileHeader";
import AboutCard from "./AboutCard";
import SuggestedPages from "./SuggestedPages";
import TwitterFeed from "./TwitterFeeds";
import Posts from "./Posts";
import LatestPhotos from "./LatestPhotos";
import Suggestions from "./Suggestions";
import Polls from "./Polls";
import { UserContext } from "../../../360/context/user";
import "../../../assets/scss/pages/users-profile.scss";
import UserProductListFoRnonLogin from "../../../360/Components/Products/UserProductListFoRnonLogin";
import styled from "styled-components";
import { setColor, media, setRem } from "../../../360/styled";
import axios from "axios";
export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = React.useContext(UserContext);
  const { id } = useParams();
  const [Allusers, setAllusers] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  React.useEffect(() => {
    axios.get("/api/users/").then((response) => {
      setAllusers(response.data);
      console.log(response.data);
    });

    return () => {};
  }, []);
  React.useEffect(() => {
    showPlaces();
  }, []);
  const showPlaces = () => {
    setIsLoading(true);
    axios.get(`/api/places/user/${id}`).then((res) => {
      console.log(res.data);
      setUserProducts(res.data);
      setIsLoading(false);
    });
  };
  const userProfile = Allusers.filter((item) => item._id === id);

  const userName = userProfile.map((item) => {
    return item.username;
  });
  const image = userProfile.map((item) => {
    return item.image;
  });

  const bio = userProfile.map((item) => {
    return item.bio;
  });

  const email = userProfile.map((item) => {
    return item.email;
  });
  const webiste = userProfile.map((item) => {
    return item.website;
  });

  const facebook = userProfile.map((item) => {
    return item.facebook;
  });

  const twitter = userProfile.map((item) => {
    return item.twitter;
  });

  const instagram = userProfile.map((item) => {
    return item.instagram;
  });

  const google = userProfile.map((item) => {
    return item.google;
  });

  const linkid = userProfile.map((item) => {
    return item.linkid;
  });

  const name = userProfile.map((item) => {
    return item.name;
  });

  const username = userProfile.map((item) => {
    return item.username;
  });

  const iduser = userProfile.map((item) => {
    return item._id;
  });

  console.log(name)
  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 2000);
  };

  return (
    <WholePage>
    <div>
      <React.Fragment>
        <div id="user-profile">
          <Row>
            <Col sm="12">
              
              <ProfileHeader image={image} userName={username} />
            </Col>
          </Row>
          <div className="wholePage">
            {/* <BreadCrumbUsers
              breadCrumbTitle="Profile"
              breadCrumbParent="All Users"
              breadCrumbActive="Profile"
            /> */}
            <div id="profile-info">
              <AboutCard
                bio={bio}
                email={email}
                name={name}
                username={username}
                webiste={webiste}
                facebook={facebook}
                twitter={twitter}
                instagram={instagram}
                google={google}
                linkid={linkid}
                iduser={iduser}

              />
            </div>
            <div className="list">
              <UserProductListFoRnonLogin products={userProducts} />
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  </WholePage>
  );
}

const WholePage = styled.div`
  .wholePage {
    padding: 0rem 0rem;
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 1.5rem;
  }
  ${media.phone`
  .wholePage {
  
    grid-template-columns: auto  ;
    /* margin:3rem; */
  }
  
  `}

  ${media.tablet`
  .wholePage {

    grid-template-columns: auto  ;
    /* margin:3rem; */
  }

 
  `}
  
  ${media.desktop`
  .wholePage {
    
    grid-template-columns: 1fr 3fr;
    /* margin:3rem 3rem; */
   
  }
  

  `}

  ${media.large`

  .wholePage {

    grid-template-columns: 1fr 3fr;
    /* margin:0rem 3rem; */
    
  }


  
  `}
`;

