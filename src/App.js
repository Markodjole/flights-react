import React, { Component } from "react";
import axios from "axios";
import "./App.css";

///////////////////// flightlist component /////////////////////////////////////////////////////////////////////////////

class FlightList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      url: null,
      flights: null,
      selectedFlight:null,
      listPage: true,
      detailsPage: false,
      onClickError: false
    };
  }


  componentDidMount() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos =>
        this.setState(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          () => {
            
    const lat = this.state.latitude;
    const lng = this.state.longitude;

    this.setState({
      url:
        "https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=" +
        lat +
        "&lng=" +
        lng +
        "&fDstL=0&fDstU=300"
    },
    ()=>{
      axios.get(this.state.url).then(res => {
        this.setState({ flights: res.data.acList });
        
      });
    }
   
    );

          }
        )
      );
      
    }
  }

  //////////////////////// set selected flight ////////////////
  selectFlight = (id) => {
    console.log("hi");
    return this.state.flights.find((flight)=>flight.Id===id)
  }
/////////////////////////// get the photo of the selected airline /////////////////////////////////////////////////
  getAirlinePhoto = () => {
      return "https://logo.clearbit.com/" + this.state.selectedFlight.Op.split(" ").join().replace(/,/g , "").toLowerCase() + ".com";
  }

  ////////////////////////// handle click /////////////////
  handleFlightClick = id => {
    if(this.state.listPage){
      this.setState({
        selectedFlight: this.selectFlight(id)
      },
      () => {
        this.setState({
          selectedFlight: {...this.state.selectedFlight, airlinePhoto: this.getAirlinePhoto()} 
        }) 
      }
      )
    }
    this.setState({
      listPage: !this.state.listPage,
      detailsPage: !this.state.detailsPage
    })
  };

  setError = (error) => {
    this.setState({selectedFlight: {...this.state.selectedFlight, onClickError: 'error'}})
  }

  render() {
    let flights = this.state.flights;
    console.log(this.state.latitude, this.state.longitude);
    console.log(flights);
    return (
      <div className="rootDiv">
        <div className="divHeader">
          <h1>Aircraft Trafic</h1>
          <p>knows who's above</p>
        </div>

        <div className="listOfFlights">
          {this.state.listPage && flights
            ? flights.map(flight => {
                return (
                  <Flight
                    id={flight.Id}
                    key={flight.Id}
                    flightNumber={flight.Id}
                    altitude={flight.Alt}
                    trak={flight.Trak}
                    onFlightClick={this.handleFlightClick}
                  />
                );
              })
            : null}
        </div>

        {this.state.detailsPage ? 
        <FlightDetails 
        onFlightClick={this.handleFlightClick}
        manufacturer={this.state.selectedFlight.Man}
        model={this.state.selectedFlight.Mdl}
        originAirport={this.state.selectedFlight.From}
        destinationAirport={this.state.selectedFlight.To}
        airlinePhoto={this.state.selectedFlight.airlinePhoto}
        onFlightClickError={this.setError}
        defaultPhoto={this.state.selectedFlight.onClickError}
        /> 
        : null}
      </div>
    );
  }
}

//////////////////////// Flight Component //////////////////////////////////////////////////////////////

function Flight(props) {
  return (
    <div className="flight" onClick={() => props.onFlightClick(props.id)}>
      <h3>Flight number: {props.flightNumber}</h3>
      <h3>Altitude: {props.altitude}</h3>
      <img  src={props.trak < 180 ?  "img/west.png" : "img/east.png"} />
    </div>
  );
}

//////////////////////// Flight Details //////////////////////////////////////////////////////////////

function FlightDetails(props) {
  console.log(props);

  const url = props.defaultPhoto === 'error' ? 'https://logo.clearbit.com/airplane-pictures.net' : props.airlinePhoto;

  return (
    <div>
    <div className="backDiv" onClick={() => props.onFlightClick(props)}>Back</div>
    <div className="flightDetails">
    
      <h3>Airplane manufacturer: {props.manufacturer}</h3>
      <h3>Airplane model: {props.model}</h3>
      <h3>Origin airport: {props.originAirport} </h3>
      <h3>Destination airport: {props.destinationAirport}</h3>
  {/* <img src={props.airlinePhoto} onError="this.onError=null;this.src='https://logo.clearbit.com/airplane-pictures.net'"/> */}
  <img src={url} onError={() => props.onFlightClickError('error')}/>

    </div>
    </div>
  );
}

export default FlightList;
