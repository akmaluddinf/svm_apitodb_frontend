import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGear, faHippo, faCat, faDove, faShieldCat } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';
import './App.css';
import Select from 'react-select';
import moment from 'moment';
import 'moment/locale/id';

const Home = ({ onLogout }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [dataPeriode, setDataPeriode] = useState([]);
  const [kodePeriodeSelected, setKodePeriodeSelected] = useState("Select");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermDataPeriode, setSearchTermDataperiode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingDataperiode, setLoadingDataPeriode] = useState(false);
  const [errorDataPeriode, setErrorDataPeriode] = useState('');
  const [totalDataApi, setTotalDataApi] = useState('');
  const [totalDataDatabase, setTotalDataDatabase] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modulDescription, setModulDescription] = useState('');
  const [tableName, setTablename] = useState('');
  const [parameterPeriode, setParameterPeriode] = useState('');
  const [fileOptions, setFileOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState('');

  const [currentPageEndpoint, setCurrentPageEndpoint] = useState(0);
  const [itemPerPageEndpoint, setItemPerPageEndpoint] = useState(10);
  const [currentPageDataPeriode, setCurrentPageDataPeriode] = useState(0);
  const [itemPerPageDataPeriode, setItemPerPageDataPeriode] = useState(10);

  const totalPagesEndpoint = Math.ceil(endpoints.length / itemPerPageEndpoint);
  const totalPagesDataPeriode = Math.ceil(dataPeriode.length / itemPerPageDataPeriode);

  const token = sessionStorage.getItem('token');

  //fetch data endpoint
  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');

    axios.get('http://localhost:3002/api/endpoints', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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
  }, [searchTerm, token]);

  //fetch data periode
  const fetchDataPeriode = useCallback(() => {
    setLoadingDataPeriode(true);
    setErrorDataPeriode('');

    axios.get('http://localhost:3002/api/dataPeriode', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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

        // Sort data by Kode Periode in ascending order
        const sortedDataPeriode = [...filteredEndpoints].sort((a, b) => a.kode_periode.localeCompare(b.kode_periode));

        setDataPeriode(sortedDataPeriode);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setErrorDataPeriode('Error fetching data');
      })
      .finally(() => {
        setLoadingDataPeriode(false);
      });
  }, [searchTermDataPeriode, token]);

  // fetch log file list
const fetchLogFileList = useCallback(async () => {
  try {
    const response = await axios.get('http://localhost:3002/api/getLogFileList', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      // Ubah format data file menjadi format yang diterima oleh react-select
      const files = response.data.files.map(file => ({ label: file, value: file }));
      setFileOptions(files);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Failed to fetch log file list',
        confirmButtonColor: '#00a65a',
      });
    }
  } catch (error) {
    console.error('Error fetching log file list:', error);
    Swal.fire({
      icon: 'error',
      text: 'An error occurred',
      confirmButtonColor: '#00a65a',
    });
  }
}, [token]);

  useEffect(() => {
    fetchData();
    fetchDataPeriode();
    fetchLogFileList();
  }, [fetchData, fetchDataPeriode, fetchLogFileList])

  //flag read data endpoint
  const getFlagStatus = (flag) => {
    return flag === 1 ? 'Active' : 'Not Active';
  };

  const handleFlagChange = (id, currentFlag) => {
    Swal.fire({
      text: 'Change the read status?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        const newFlag = currentFlag === 1 ? 0 : 1;

        axios.patch(`http://localhost:3002/api/endpoints/${id}`, { __read: newFlag }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            fetchData();

            Swal.fire({
              text: response.data.message,
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
  };

  const handleUpdateAllFlags = (newFlag) => {
    Swal.fire({
      text: `Change all read status to ${newFlag === 1 ? 'Active' : 'Not Active'}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.patch('http://localhost:3002/api/endpoints/updateAllFlag', { __read: newFlag }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            fetchData();

            Swal.fire({
              text: response.data.message,
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

  //flag read data periode
  const getFlagStatusDataPeriode = (flag) => {
    return flag === 1 ? 'Active' : 'Not Active';
  };

  const handleFlagChangeDataPeriode = (id, currentFlag) => {
    Swal.fire({
      text: 'Change the read status?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        const newFlag = currentFlag === 1 ? 0 : 1;

        axios.patch(`http://localhost:3002/api/dataPeriode/${id}`, { __read: newFlag }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            fetchDataPeriode();

            Swal.fire({
              text: response.data.message,
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
  };

  const handleUpdateAllFlagsDataPeriode = (newFlag) => {
    Swal.fire({
      text: `Change all read status to ${newFlag === 1 ? 'Active' : 'Not Active'}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.patch('http://localhost:3002/api/dataPeriode/updateAllFlag', { __read: newFlag }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            fetchDataPeriode();

            Swal.fire({
              text: response.data.message,
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
    onLogout();
  };

  const handleCheckData = async (endpointUrl) => {
    let moduleName = endpointUrl.split('/').pop();

    if (moduleName === 'biodatamhs') {
      moduleName = 'mahasiswa';
    } else if (moduleName === 'swithingbank') {
      moduleName = 'masterbank';
    }
    setModulDescription(moduleName);

    try {
      setModalLoading(true);

      const response = await axios.post(`http://localhost:3002/api/cekTotalData/${moduleName}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTotalDataApi(response.data.totalDataApi)
      setTotalDataDatabase(response.data.totalDataDatabase);

      setModalLoading(false);

    } catch (error) {
      setModalLoading(false);
      const infoError = `Error when processing total data ${moduleName}: ${error.message}`
      console.error(infoError);
    }
  };


  //handle show modal delete data
  const handleShowModalDeleteData = (endpointUrl, endpointTable, paramPeriode) => {
    setKodePeriodeSelected("");
    let moduleName = endpointUrl.split('/').pop();

    if (moduleName === 'biodatamhs') {
      moduleName = 'mahasiswa';
    } else if (moduleName === 'swithingbank') {
      moduleName = 'masterbank';
    }

    if (paramPeriode === "" || paramPeriode === null) {
      // paramPeriode = 'All';
      setKodePeriodeSelected("All");
    }

    setModulDescription(moduleName);
    setTablename(endpointTable);
    setParameterPeriode(paramPeriode);
    setSearchTermDataperiode('')
  }

  const handleConfirmationDeleteData = () => {
    if (!kodePeriodeSelected) {
      Swal.fire({
        text: 'Periode is required.',
        icon: 'warning',
        confirmButtonColor: '#00a65a',
      });
    } else {
      Swal.fire({
        title: 'Delete this record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes',
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteData();
        }
      });
    }
  };

  //handle delete data
  const handleDeleteData = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/deleteData', {
        tableName: tableName,
        periode: kodePeriodeSelected
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Swal.fire({
          text: response.data.message,
          icon: 'success',
          confirmButtonColor: '#00a65a',
        });
      } else {
        Swal.fire({
          text: response.data.message,
          icon: 'warning',
          confirmButtonColor: '#00a65a',
        });
      }

    } catch (error) {
      const infoError = `Error during delete data ${modulDescription}: ${error.message}`;
      console.error(infoError);
      Swal.fire({
        text: infoError,
        icon: 'error',
        confirmButtonColor: '#00a65a',
      });
    }
  };

  // function execute migration
  const executeMigration = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/runMigration', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response.data);

      if (response.data.success) {
        console.log('Migration executed successfully');
      } else {
        console.error('Error during migration:', response.data.message);
      }
    } catch (error) {
      console.error('Error during migration:', error.message);
    }
  };

  const handleChangeKodePeriode = (selectedOption) => {
    const selectedKodePeriodeValue = selectedOption.value;
    setKodePeriodeSelected(selectedKodePeriodeValue);
    console.log(selectedKodePeriodeValue);
  };

  const handleChangeFileLog = (selectedOption) => {
    const selectedFileLogValue = selectedOption.value;
    setSelectedFile(selectedFileLogValue);
    console.log(selectedFileLogValue);
  };

  const handleOpenLog = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'error',
        text: 'Please select a log file',
        confirmButtonColor: '#00a65a',
      });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3002/api/getLogFileContent/${selectedFile}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setLogContent(response.data.content);
      } else {
        Swal.fire({
          icon: 'error',
          text: 'Failed to fetch log content',
          confirmButtonColor: '#00a65a',
        });
      }
    } catch (error) {
      console.error('Error fetching log content:', error);
      Swal.fire({
        icon: 'error',
        text: 'An error occurred',
        confirmButtonColor: '#00a65a',
      });
    }
  };

  const handleClearLog = () => {
    setSelectedFile(null);
    setLogContent("");
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
            <li className="nav-item">
              <a className="nav-link" id="tab3-tab" data-bs-toggle="pill" href="#tab3" role="tab" style={{ color: "black" }}>
                History Log
              </a>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="tab1" role="tabpanel">
              <div className='row' style={{ marginTop: "20px" }}>
                <div className='col-md-4' style={{ marginBottom: "20px" }}>
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
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => executeMigration()}>Execute Endpoint</li>
                    </ul>
                  </div>
                  <div>
                    <button type="button" className="btn btn-danger" onClick={handleLogout} style={{ marginLeft: "20px" }}>Logout</button>
                  </div>
                </div>
              </div>
              <div className='row' style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div className='col-md-12'>
                  {loadingDataperiode && <p>Loading...</p>}
                  {errorDataPeriode && <p style={{ color: 'red' }}>{errorDataPeriode}</p>}
                  {!loadingDataperiode && !errorDataPeriode && (
                    <div className="table-responsive">
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
                                background: item.__read === 1 ? '#26ff000f' : '#f3444414',
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
                    </div>
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
                        pageCount={totalPagesDataPeriode}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={0}
                        onPageChange={handlePageClickDataPeriode}
                        containerClassName="pagination"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        nextClassName="page-item"
                        previousLinkClassName="page-link"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
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
                <div className='col-md-4' style={{ marginBottom: "20px" }}>
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
                      <li className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => executeMigration()}>Execute Endpoint</li>
                    </ul>
                  </div>
                  <div>
                    <button type="button" className="btn btn-danger" onClick={handleLogout} style={{ marginLeft: "20px" }}>Logout</button>
                  </div>
                </div>
              </div>
              <div className='row' style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div className='col-md-12'>
                  {loading && <p>Loading...</p>}
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  {!loading && !error && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover text-nowrap table-sm">
                        <thead style={{ textAlign: "center" }}>
                          <tr>
                            <th>No</th>
                            <th>Endpoint</th>
                            <th>Parameter</th>
                            <th>Description</th>
                            <th>Read</th>
                            <th>Last Updated</th>
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
                              <td>{endpoint.endpoints_url.split('/').pop()}</td>
                              <td>{endpoint.endpoints_param}</td>
                              <td>{endpoint.endpoints_desc}</td>
                              <td>
                                {getFlagStatus(endpoint.__read)}
                              </td>
                              <td>{moment.utc(endpoint.__updated_date).locale('id').format('DD MMMM YYYY HH:mm')}</td>
                              <td style={{ textAlign: "center" }}>
                                {endpoint.__read === 1 ? (
                                  <FontAwesomeIcon icon={faHippo} onClick={() => handleFlagChange(endpoint.endpoints_fid, endpoint.__read)} style={{ cursor: "pointer", color: "red", height: "26px" }} data-toggle="tooltip" title="Set Read Statud Not Active" data-placement="top" />
                                ) : (
                                  <FontAwesomeIcon icon={faCat} onClick={() => handleFlagChange(endpoint.endpoints_fid, endpoint.__read)} style={{ cursor: "pointer", color: "00a65a", height: "26px" }} data-toggle="tooltip" title="Set Read Status Active" data-placement="top" />
                                )}
                                <FontAwesomeIcon
                                  icon={faDove}
                                  onClick={() => handleCheckData(endpoint.endpoints_url)}
                                  style={{ cursor: "pointer", color: "#007bff", height: "26px", marginLeft: "10px" }}
                                  data-toggle="tooltip"
                                  title="Check Total Data"
                                  data-placement="top"
                                  data-bs-toggle="modal" data-bs-target="#modalCheckData"
                                />
                                <FontAwesomeIcon
                                  icon={faShieldCat}
                                  onClick={() => handleShowModalDeleteData(endpoint.endpoints_url, endpoint.endpoints_table, endpoint.endpoints_param)}
                                  style={{ cursor: "pointer", color: "red", height: "26px", marginLeft: "10px" }}
                                  data-toggle="tooltip"
                                  title="Delete Data"
                                  data-placement="top"
                                  data-bs-toggle="modal" data-bs-target="#modalDelete"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                        pageCount={totalPagesEndpoint}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={0}
                        onPageChange={handlePageClickEndpoint}
                        containerClassName="pagination"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        nextClassName="page-item"
                        previousLinkClassName="page-link"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
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


            <div className="tab-pane fade" id="tab3" role="tabpanel">
              <div className="row" style={{ marginTop: "20px" }}>
                <div className="col-md-4" style={{ marginBottom: "20px" }}>
                  <Select
                    options={fileOptions}
                    value={selectedFile ? { value: selectedFile, label: selectedFile } : null}
                    onChange={handleChangeFileLog}
                    placeholder="Select a log file"
                    isSearchable
                  />
                </div>
                <div className='col-md-8' style={{ display: 'flex', justifyContent: "right", height: "100%" }}>
                  <button onClick={handleOpenLog} className="btn btn-primary" style={{ marginRight: "20px" }}>Open</button>
                  <button onClick={handleClearLog} className="btn btn-secondary" style={{ marginRight: "20px" }}>Close</button>
                  <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
                  {logContent &&
                    <div className='row' style={{ backgroundColor: "#80808017" }}>
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <pre>{logContent}</pre>
                      </div>
                    </div>
                  }
                </div>
              </div>

            </div> {/* end tab pane 3*/}

          </div> {/* end tab content */}

        </div>
      </div>

      {/* Modal check total data  */}
      <div className="modal fade" id="modalCheckData" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Information {modulDescription} record</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <button className="btn btn-primary" type="button" disabled>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{ marginRight: "10px" }}></span>
                  <span role="status">Loading...</span>
                </button>
              ) : (
                <div>
                  <p>API: {totalDataApi.toLocaleString()}</p>
                  <p>Database: {totalDataDatabase.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal delete data  */}
      <div className="modal fade" id="modalDelete" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Record</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className='row'>
                <div className='col-3'>
                  <p>Table: </p>
                </div>
                <div className='col-9'>
                  <p>{tableName}</p>
                </div>
              </div>

              <div className='row'>
                <div className='col-3'>
                  {
                    parameterPeriode === '' || parameterPeriode === null ?
                      ""
                      :
                      <p>Periode: </p>
                  }
                </div>
                <div className='col-9'>
                  {
                    parameterPeriode === '' || parameterPeriode === null ?
                      ""
                      :
                      <Select
                        id="kodePeriode"
                        value={kodePeriodeSelected ? { value: kodePeriodeSelected, label: kodePeriodeSelected } : null}
                        onChange={handleChangeKodePeriode}
                        options={[
                          { value: 'All', label: 'All' },
                          ...dataPeriode.map(item => ({ value: item.kode_periode, label: item.kode_periode })),
                        ]}
                        placeholder="Select periode"
                      />
                  }

                </div>
              </div>

              <div className='row' style={{ padding: "10px" }}>
                <button type="button" className="btn btn-danger" onClick={handleConfirmationDeleteData} data-toggle="tooltip" title="Select periode to process delete data" data-placement="top">Process</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home