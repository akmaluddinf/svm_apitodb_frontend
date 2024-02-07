import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGear, faHippo, faCat } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';
import './App.css';

const Home = ({ onLogout }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [dataPeriode, setDataPeriode] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermDataPeriode, setSearchTermDataperiode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingDataperiode, setLoadingDataPeriode] = useState(false);
  const [errorDataPeriode, setErrorDataPeriode] = useState('');

  const [currentPageEndpoint, setCurrentPageEndpoint] = useState(0);
  const [itemPerPageEndpoint, setItemPerPageEndpoint] = useState(10);
  const [currentPageDataPeriode, setCurrentPageDataPeriode] = useState(0);
  const [itemPerPageDataPeriode, setItemPerPageDataPeriode] = useState(10);

  // Menghitung jumlah halaman total
  const totalPagesEndpoint = Math.ceil(endpoints.length / itemPerPageEndpoint);
  const totalPagesDataPeriode = Math.ceil(dataPeriode.length / itemPerPageDataPeriode);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');

    axios.get('http://localhost:3002/api/endpoints')
      .then(response => {
        const allEndpoints = response.data;
        const filteredEndpoints = allEndpoints.filter(endpoint => {
          const endpointValues = Object.values(endpoint);

          return endpointValues.some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
        });

        setEndpoints(filteredEndpoints);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm]);

  //data periode
  const fetchDataPeriode = useCallback(() => {
    setLoadingDataPeriode(true);
    setErrorDataPeriode('');

    axios.get('http://localhost:3002/api/dataPeriode')
      .then(response => {
        const allEndpoints = response.data;
        const filteredEndpoints = allEndpoints.filter(endpoint => {
          const endpointValues = Object.values(endpoint);

          return endpointValues.some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTermDataPeriode.toLowerCase());
            }
            return false;
          });
        });

        setDataPeriode(filteredEndpoints);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setErrorDataPeriode('Error fetching data');
      })
      .finally(() => {
        setLoadingDataPeriode(false);
      });
  }, [searchTermDataPeriode]);


  useEffect(() => {
    fetchData();
    fetchDataPeriode();
  }, [fetchData, fetchDataPeriode])

  const getFlagStatus = (flag) => {
    return flag === 1 ? 'Active' : 'Not Active';
  };

  const handleFlagChange = (id, currentFlag) => {
    Swal.fire({
      text: 'Are you sure want to change the read status?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        const newFlag = currentFlag === 1 ? 0 : 1;
        console.log("new flag", newFlag);

        axios.patch(`http://localhost:3002/api/endpoints/${id}`, { __read: newFlag })
          .then(response => {
            console.log(response.data.message);
            fetchData();

            Swal.fire({
              text: 'Read status successfully changed.',
              icon: 'success',
              confirmButtonColor: '#00a65a',
            });
          })
          .catch(error => {
            console.error('Error updating read status:', error);
            Swal.fire({
              text: 'Error updating read status.',
              icon: 'error',
              confirmButtonColor: '#00a65a',
            });
          });
      }
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    // fetchData();
  };

  const handleUpdateAllFlags = (newFlag) => {
    Swal.fire({
      text: `Are you sure want to change all read status to ${newFlag === 1 ? 'Active' : 'Not Active'}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.patch('http://localhost:3002/api/endpoints/updateAllFlag', { __read: newFlag })
          .then(response => {
            console.log(response.data.message);
            fetchData();

            Swal.fire({
              text: `Read status successfully changed.`,
              icon: 'success',
              confirmButtonColor: '#00a65a',
            });
          })
          .catch(error => {
            console.error('Error updating all read status:', error);
            Swal.fire({
              text: 'Error updating all read status.',
              icon: 'error',
              confirmButtonColor: '#00a65a',
            });
          });
      }
    });
  };

  //data periode =========================================
  const getFlagStatusDataPeriode = (flag) => {
    return flag === 1 ? 'Active' : 'Not Active';
  };

  const handleFlagChangeDataPeriode = (id, currentFlag) => {
    Swal.fire({
      text: 'Are you sure want to change the read status?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        const newFlag = currentFlag === 1 ? 0 : 1;
        console.log("new flag", newFlag);

        axios.patch(`http://localhost:3002/api/dataPeriode/${id}`, { __read: newFlag })
          .then(response => {
            console.log(response.data.message);
            fetchDataPeriode();

            Swal.fire({
              text: 'Read status successfully changed.',
              icon: 'success',
              confirmButtonColor: '#00a65a',
            });
          })
          .catch(error => {
            console.error('Error updating read status:', error);
            Swal.fire({
              text: 'Error updating read status.',
              icon: 'error',
              confirmButtonColor: '#00a65a',
            });
          });
      }
    });
  };

  const handleSearchChangeDataPeriode = (event) => {
    setSearchTermDataperiode(event.target.value);
  };

  const clearSearchDataPeriode = () => {
    setSearchTermDataperiode('');
    // fetchData();
  };

  const handleUpdateAllFlagsDataPeriode = (newFlag) => {
    Swal.fire({
      text: `Are you sure want to change all read status to ${newFlag === 1 ? 'Active' : 'Not Active'}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.patch('http://localhost:3002/api/dataPeriode/updateAllFlag', { __read: newFlag })
          .then(response => {
            console.log(response.data.message);
            fetchDataPeriode();

            Swal.fire({
              text: `Read status successfully changed.`,
              icon: 'success',
              confirmButtonColor: '#00a65a',
            });
          })
          .catch(error => {
            console.error('Error updating all read status:', error);
            Swal.fire({
              text: 'Error updating all read status.',
              icon: 'error',
              confirmButtonColor: '#00a65a',
            });
          });
      }
    });
  };

  //pagination
  // Hitung indeks data yang akan ditampilkan di halaman saat ini setelah pencarian
  const indexOfLastItemEndpoint = (currentPageEndpoint + 1) * itemPerPageEndpoint;
  const indexOfFirstItemEndpoint = indexOfLastItemEndpoint - itemPerPageEndpoint;
  const currentItemEndpoint = endpoints.slice(indexOfFirstItemEndpoint, indexOfLastItemEndpoint);

  //data periode
  const indexOfLastItemDataPeriode = (currentPageDataPeriode + 1) * itemPerPageDataPeriode;
  const indexOfFirstItemDataPeriode = indexOfLastItemDataPeriode - itemPerPageDataPeriode;
  const currentItemDataPeriode = dataPeriode.slice(indexOfFirstItemDataPeriode, indexOfLastItemDataPeriode);

  const handlePageClickEndpoint = ({ selected }) => {
    setCurrentPageEndpoint(selected);
  };

  const handlePageClickDataPeriode = ({ selected }) => {
    setCurrentPageDataPeriode(selected);
  };

  const handleItemPerPageChangeEndpoint = (event) => {
    setItemPerPageEndpoint(Number(event.target.value));
    setCurrentPageEndpoint(0);
  };

  const handleItemPerPageChangeDataPeriode = (event) => {
    setItemPerPageDataPeriode(Number(event.target.value));
    setCurrentPageDataPeriode(0);
  };

  const handleLogout = () => {
    onLogout(); // Panggil fungsi onLogout untuk mengubah status login di komponen induk
  };

  return (
    <div className='container mt-5'>
      <h1 className="mb-4" style={{ textAlign: "center" }}>Migration Data API</h1>
      <div className='row'>
        <div className='col-lg-12'>
          <ul className="nav nav-underline" style={{ fontSize: "16px" }}>
            <li className="nav-item">
              <a className="nav-link active" id="tab1-tab" data-bs-toggle="pill" href="#tab1" role="tab" style={{ color: "black" }}>
                Data Periode
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="tab2-tab" data-bs-toggle="pill" href="#tab2" role="tab" style={{ color: "black" }}>
                Data Endpoint
              </a>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="tab1" role="tabpanel">
              <div className='row' style={{ marginTop: "20px" }}>
                <div className='col-md-4' style={{marginBottom: "20px"}}>
                  <div className="input-group">
                    <input
                      type="text"
                      id="searchInputDataPeriode"
                      className="form-control"
                      placeholder='Search...'
                      value={searchTermDataPeriode}
                      onChange={handleSearchChangeDataPeriode}
                    />
                    {searchTermDataPeriode && (
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={clearSearchDataPeriode}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>
                </div>
                <div className='col-md-8' style={{ display: 'flex', justifyContent: "right" }}>
                  <div className="dropdown">
                    <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: "white", backgroundColor: "orange" }}>
                      <span><FontAwesomeIcon icon={faGear} style={{ marginRight: "10px" }} />Batch</span>
                    </button>
                    <ul className="dropdown-menu dropdown-hover">
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleUpdateAllFlagsDataPeriode(1)}>Set status read active</li>
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleUpdateAllFlagsDataPeriode(0)}>Set status read not active</li>
                    </ul>
                  </div>
                  <div>
                    <button type="button" className="btn btn-danger" onClick={handleLogout} style={{marginLeft: "20px"}}>Logout</button>
                  </div>
                </div>
              </div>
              <div className='row' style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div className='col-md-12'>
                  {loadingDataperiode && <p>Loading...</p>}
                  {errorDataPeriode && <p style={{ color: 'red' }}>{errorDataPeriode}</p>}
                  {!loadingDataperiode && !errorDataPeriode && (
                    <table className="table table-bordered table-hover text-nowrap table-sm">
                      <thead style={{ textAlign: "center" }}>
                        <tr>
                          <th>No</th>
                          <th>Kode Periode</th>
                          <th>Nama Periode</th>
                          <th>Read</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItemDataPeriode.map((item, index) => (
                          <tr
                            key={item.fid}
                            style={{
                              background: item.flag === 1 ? '#26ff000f' : '#f3444414',
                              color: 'black',
                            }}
                          >
                            <td>{(currentPageDataPeriode) * itemPerPageDataPeriode + index + 1}</td>
                            <td>{item.kode_periode}</td>
                            <td>{item.nama_periode}</td>
                            <td>
                              {getFlagStatusDataPeriode(item.__read)}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {item.__read === 1 ? (
                                <FontAwesomeIcon icon={faHippo} onClick={() => handleFlagChangeDataPeriode(item.fid, item.__read)} style={{ cursor: "pointer", color: "red", height: "26px" }} data-toggle="tooltip" title="Set Status Read Non Aktif" data-placement="top" />
                              ) : (
                                <FontAwesomeIcon icon={faCat} onClick={() => handleFlagChangeDataPeriode(item.fid, item.__read)} style={{ cursor: "pointer", color: "00a65a", height: "26px" }} data-toggle="tooltip" title="Set Status Read Aktif" data-placement="top" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* pagination */}
              <div className='row'>
                <div className='col-md-6'>
                  <div className='col'>
                    <div>Total Data: {dataPeriode.length}</div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='row'>
                    <div className='col-md-5' style={{ display: "flex", justifyContent: "right" }}>
                      <div className="mb-3">
                        <select
                          className="form-select"
                          value={itemPerPageDataPeriode}
                          onChange={handleItemPerPageChangeDataPeriode}
                        >
                          <option value={10}>10 rows</option>
                          <option value={50}>50 rows</option>
                          <option value={100}>100 rows</option>
                          <option value={500}>500 rows</option>
                        </select>
                      </div>
                    </div>
                    <div className='col-md-7' style={{ display: "flex", justifyContent: "right" }}>
                      <ReactPaginate
                        forcePage={Math.min(currentPageDataPeriode, totalPagesDataPeriode - 1)}
                        // forcePage={currentPageDataPeriode}
                        pageCount={totalPagesDataPeriode}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={0}
                        onPageChange={handlePageClickDataPeriode}
                        containerClassName="pagination" // Bootstrap class
                        pageClassName="page-item" // Bootstrap class
                        pageLinkClassName="page-link" // Bootstrap class
                        previousClassName="page-item" // Bootstrap class
                        nextClassName="page-item" // Bootstrap class
                        previousLinkClassName="page-link" // Bootstrap class
                        nextLinkClassName="page-link" // Bootstrap class
                        breakClassName="page-item" // Bootstrap class
                        breakLinkClassName="page-link" // Bootstrap class
                        activeClassName="active"
                        previousLabel="Previous"
                        nextLabel="Next"
                        breakLabel="..."
                      />
                    </div>

                  </div>

                </div>

              </div>

            </div> {/* end tab pane 1 */}

            <div className="tab-pane fade" id="tab2" role="tabpanel">
              <div className='row' style={{ marginTop: "20px" }}>
                <div className='col-md-4' style={{ display: 'flex', justifyContent: "right" }}>
                  <div className="input-group">
                    <input
                      type="text"
                      id="searchInput"
                      className="form-control"
                      placeholder='Search...'
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={clearSearch}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>
                </div>
                <div className='col-md-8' style={{ display: 'flex', justifyContent: "right" }}>
                  <div className="dropdown">
                    <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: "white", backgroundColor: "orange" }}>
                      <span><FontAwesomeIcon icon={faGear} style={{ marginRight: "10px" }} />Batch</span>
                    </button>
                    <ul className="dropdown-menu dropdown-hover">
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleUpdateAllFlags(1)}>Set status read active</li>
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleUpdateAllFlags(0)}>Set status read not active</li>
                    </ul>
                  </div>
                  <div>
                    <button type="button" className="btn btn-danger" onClick={handleLogout} style={{marginLeft: "20px"}}>Logout</button>
                  </div>
                </div>
              </div>
              <div className='row' style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div className='col-md-12'>
                  {loading && <p>Loading...</p>}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {!loading && !error && (
                    <table className="table table-bordered table-hover text-nowrap table-sm">
                      <thead style={{ textAlign: "center" }}>
                        <tr>
                          <th>No</th>
                          <th>Endpoint</th>
                          <th>Parameter</th>
                          <th>Description</th>
                          <th>Read</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItemEndpoint.map((endpoint, index) => (
                          <tr
                            key={endpoint.endpoints_fid}
                            style={{
                              background: endpoint.__read === 1 ? '#26ff000f' : '#f3444414',
                              color: 'black',
                            }}
                          >
                            <td>{(currentPageEndpoint) * itemPerPageEndpoint + index + 1}</td>
                            <td>{endpoint.endpoints_url}</td>
                            <td>{endpoint.endpoints_param}</td>
                            <td>{endpoint.endpoints_desc}</td>
                            <td>
                              {getFlagStatus(endpoint.__read)}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {endpoint.__read === 1 ? (
                                <FontAwesomeIcon icon={faHippo} onClick={() => handleFlagChange(endpoint.endpoints_fid, endpoint.__read)} style={{ cursor: "pointer", color: "red", height: "26px" }} data-toggle="tooltip" title="Set Status Read Non Aktif" data-placement="top" />
                              ) : (
                                <FontAwesomeIcon icon={faCat} onClick={() => handleFlagChange(endpoint.endpoints_fid, endpoint.__read)} style={{ cursor: "pointer", color: "00a65a", height: "26px" }} data-toggle="tooltip" title="Set Status Read Aktif" data-placement="top" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* pagination */}
              <div className='row'>
                <div className='col-md-6'>
                  <div className='col'>
                    <div>Total Data: {endpoints.length}</div>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='row'>
                    <div className='col-md-5' style={{ display: "flex", justifyContent: "right" }}>
                      <div className="mb-3">
                        <select
                          className="form-select"
                          value={itemPerPageEndpoint}
                          onChange={handleItemPerPageChangeEndpoint}
                        >
                          <option value={10}>10 rows</option>
                          <option value={50}>50 rows</option>
                          <option value={100}>100 rows</option>
                          <option value={500}>500 rows</option>
                        </select>
                      </div>
                    </div>
                    <div className='col-md-7' style={{ display: "flex", justifyContent: "right" }}>
                      <ReactPaginate
                        forcePage={Math.min(currentPageEndpoint, totalPagesEndpoint - 1)}
                        // forcePage={currentPageEndpoint}
                        pageCount={totalPagesEndpoint}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={0}
                        onPageChange={handlePageClickEndpoint}
                        containerClassName="pagination" // Bootstrap class
                        pageClassName="page-item" // Bootstrap class
                        pageLinkClassName="page-link" // Bootstrap class
                        previousClassName="page-item" // Bootstrap class
                        nextClassName="page-item" // Bootstrap class
                        previousLinkClassName="page-link" // Bootstrap class
                        nextLinkClassName="page-link" // Bootstrap class
                        breakClassName="page-item" // Bootstrap class
                        breakLinkClassName="page-link" // Bootstrap class
                        activeClassName="active"
                        previousLabel="Previous"
                        nextLabel="Next"
                        breakLabel="..."
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div> {/* end tab pane 2 */}

          </div> {/* end tab content */}

        </div>
      </div>


    </div>
  )
}

export default Home