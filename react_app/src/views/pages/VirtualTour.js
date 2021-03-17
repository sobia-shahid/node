import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'reactstrap';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import Breadcrumbs from '../../components/@vuexy/breadCrumbs/BreadCrumbAddTour';
import UserProductList from '../../360/Components/Products/UserProductList';
import Pagination from '../../components/@vuexy/Pagination/Pagination';
import { ProductContext } from '../../360/context/products';
import { UserContext } from '../../360/context/user';
import axios from 'axios';
import imaga from '../../360/Assets/nice1.jpg';
import Loading from '../../components/@vuexy/spinner/Loading-spinner';
import ContentLoader, { Facebook } from 'react-content-loader';
import { PlusCircle } from 'react-feather';
import Frame from '../../360/Pages/FrameNoVirtual';

export default function VirtualTour() {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    axios
      .put(`/api/gateway/sub/${user.user.subscriptionId}/status`, { email: user.user.email })
      .then((res) => {
        if (!res.data.status) {
          // it will remove the subscriptionId and customerId from localstorage
          user.user.isPremium = false;
          user.user.subscriptionId = '';
          user.user.customerId = '';

          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .catch((err) => {
        user.user.isPremium = false;
        user.user.subscriptionId = '';
        user.user.customerId = '';

        localStorage.setItem('user', JSON.stringify(user));
      });
  }, []);
  const { products } = React.useContext(ProductContext);
  const history = useHistory();
  const MyLoader = (props) => (
    <ContentLoader
      speed={2}
      width={1200}
      height={500}
      viewBox="0 0 1200 500"
      backgroundColor="#0ca8fd"
      foregroundColor="#ecebeb"
      {...props}
    >
      <rect x="48" y="8" rx="3" ry="3" width="88" height="6" />
      <rect x="48" y="26" rx="3" ry="3" width="52" height="6" />
      <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
      <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
      <rect x="0" y="88" rx="3" ry="3" width="178" height="6" />
      <circle cx="20" cy="20" r="20" />
    </ContentLoader>
  );
  const { user } = React.useContext(UserContext);
  const { counter } = React.useContext(ProductContext);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(3);
  const [ uid, setUid ] = useState(user.user ? user.user._id : '');
  const [ userProducts, setUserProducts ] = useState([]);
  const [ userProductsLength, setUserProductsLength ] = useState('');
  const [ loading, setloading ] = useState(false);
  const [ username, setUsername ] = useState(user.user ? user.user.username : '');
  let UserProduct = products.filter((pro) => pro.userId == uid);
  React.useEffect(() => {
    if (uid === '') {
      history.push('/');
    }
    showPlaces();
  }, []);
  const showPlaces = () => {
    setloading(true);
    axios
      .get(`/api/places/user/${uid}`, {
        params: { currentPage, pageSize }
      })
      .then((res) => {
        console.log(res.data);
        setUserProducts(res.data);
        setUserProductsLength(res.data.length);

        setloading(false);
      });
  };
  let handlePageChange = (currentPage) => {
    console.log(currentPage);
    setCurrentPage(currentPage);
    setloading(true);
    axios
      .get(`/api/places/user/${uid}`, {
        params: { currentPage, pageSize }
      })
      .then((res) => {
        console.log(res.data);
        setUserProducts(res.data);

        setloading(false);
      });
  };
  if (loading) {
    return MyLoader();
  }
  {
    setInterval(() => {
      setloading(false);
    }, 1000);
  }
  return (
    <React.Fragment>
      {userProductsLength <= 0 ? (
        <React.Fragment>
          <div>
            <Breadcrumbs
              breadCrumbTitle="Virtual Tours"
              breadCrumbParent="Dashboard"
              breadCrumbActive="Virtual Tours"
            />
            <Card>
              <Frame
                image={imaga}
                animation={`property: rotation; from:0 0 0; to: 0 360 0; loop: true; dur: 40000;`}
                zoom="1"
                fov="80"
              >
                {' '}
              </Frame>
              <div
                style={{
                  width: '100%',
                  height: '500px',
                  backgroundColor: 'black',
                  opacity: '0.8',
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                  zIndex: '1',
                  display: 'grid'
                }}
              >
                <div style={{ justifySelf: 'center', alignSelf: 'center' }}>
                  <PlusCircle
                    style={{ zIndex: '2', cursor: 'pointer' }}
                    size={70}
                    color="white"
                    onClick={() => history.push('/AddPlace')}
                  />
                  <h4
                    style={{
                      textAlign: 'center',
                      color: 'white',

                      textTransform: 'uppercase',
                      justifySelf: 'center',
                      position: 'absolute',
                      left: '50%',
                      top: '62%',
                      transform: 'translate(-50%,50%)'
                    }}
                  >
                    Dear {username}, create your first virtual tour
                  </h4>
                </div>
              </div>
            </Card>
          </div>
        </React.Fragment>
      ) : (
        <Row>
          <Col lg="12">
            {loading ? (
              MyLoader()
            ) : (
              <React.Fragment>
                <Breadcrumbs
                  breadCrumbTitle="Virtual Tours"
                  breadCrumbParent="Dashboard"
                  breadCrumbActive="Virtual Tours"
                />
                <UserProductList products={userProducts} counter={counter} />
                <Pagination
                  itemsCount={UserProduct.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </React.Fragment>
            )}
          </Col>
        </Row>
      )}
      {/* <Row>
        <Col lg="12">
          {loading ? (
            MyLoader()
          ) : (
            <>
              <Breadcrumbs
                breadCrumbTitle="Virtual Tours"
                breadCrumbParent="Dashboard"
                breadCrumbActive="Virtual Tours"
              />
              <UserProductList products={userProducts} counter={counter} />
              <Pagination
                itemsCount={UserProduct.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </Col>
      </Row> */}
    </React.Fragment>
  );
}
