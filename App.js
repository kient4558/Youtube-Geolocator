import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { CardActionArea, CardActions } from '@mui/material';
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl, MapConsumer } from 'react-leaflet';
import 'esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import "./App.css"
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { createTheme, ThemeProvider} from '@mui/material/styles';

function VideoCard({ video }) {
  return (
    <Card sx={{ minHeight: "40%", margin: "15px 15px 0px 15px", boxShadow: "0 3px 10px rgb(0 0 0 / .2)" }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="150"
          image={video != undefined ? video.thumbnail : "white.png"}
          alt="thumbnail"
        />
        <CardContent>
          <Typography gutterBottom variant="h7" component="div">
            {video != undefined ? video.title : ""}
          </Typography>
          <Typography variant="overline" color="text.secondary">
            {video != undefined ? video.publishDate : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {video != undefined ? video.description : ""}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: '#FF0000',
    },
    dark: {
      main: "#282828"
    },
  },
});

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const center = {
  lat: 51.505,
  lng: -0.09,
}

const defaultVideo = {
  'title': "video.snippet.title",
  'publishDate': "video.snippet.publishedAt",
  'thumbnail': "video.snippet.thumbnails.default.url",
  'description': "video.snippet.description"
}

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function App() {
  const [searchValue, setSearchvalue] = useState(""); // keyword search value
  const [searchValue2, setSearchvalue2] = useState(""); // keyword search 2
  const [searchLocationValue, setSearchLocationvalue] = useState(""); // location search value
  const [position, setPosition] = useState(center) // position
  const [videoData, setVideoData] = useState(defaultVideo) // video data
  const markerRef = useRef(null)
  const [radius, setRadius] = React.useState(10); // radius

  const handleSliderChange = (event, newValue) => {
    setRadius(newValue);
  };

  const handleInputChange = (event) => {
    setRadius(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (radius < 0) {
      setRadius(0);
    } else if (radius > 100) {
      setRadius(100);
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [],
  );
  
  const assignCoord = (coords) => {
    const res = {
      lat: coords.latlng.lat,
      lng: coords.latlng.lng,
    }
    setPosition(res);
  };

  const handleSearch = () => {
    // Replace YOUR_API_KEY with your actual API key
    const API_KEY = "API_KEY_HERE";
    const coord1 = position.lat;
    const coord2 = position.lng;
    const location = coord1 + "%2C" + coord2;
    const tempData = {}; // temp object for data
    
    // Make a request to the YouTube API with the search query
    const url = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&location=" + location + "&locationRadius=" + radius + "mi&q=" + searchValue + searchValue2 + "&type=video&key=" + API_KEY;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        var dynamicNameCounter = 1; // dynamic naming convention number
        // for each video
        data.items.forEach(video => {
          // extract data
          // assign properties: dynamic objects named video(n)
          tempData['video' + dynamicNameCounter] = {
            // implement data into each video
            'title': video.snippet.title,
            'publishDate': video.snippet.publishedAt,
            'thumbnail': video.snippet.thumbnails.high.url,
            'description': video.snippet.description
          }
          // increment counter
          dynamicNameCounter++;
        });
        // set object to videoData global variable
        setVideoData(tempData);
        console.log(videoData);
      });
  }
  
  return (
  <div style={{ height: "98vh", width: "100%"}}>
    <Box sx={{ flexGrow: 1 }}>
      <nav style={{position: "relative", zIndex: 2, boxShadow: "0px 5px 10px rgb(0 0 0 / .3)"}}>
          <div id="heading" class="nav-section">
            <SmartDisplayIcon/>      
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, justifyContent: center, verticalAlign: 'middle'}}
            >
              YouTube Geo-Locator
            </Typography>
            <Typography id="input-slider" gutterBottom>
                  Radius
            </Typography>
            <div class="slider">
              <Box sx={{ width: 200 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                  </Grid>
                  <Grid item xs>
                    <ThemeProvider theme={theme}>
                      <Slider
                        value={typeof radius === 'number' ? radius : 0}
                        onChange={handleSliderChange}
                        aria-labelledby="input-slider"
                        color="primary"
                      />
                    </ThemeProvider>
                  </Grid>
                  <Grid item>
                    <Input
                      value={radius}
                      size="small"
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      inputProps={{
                        step: 10,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                      }}
                    />
                  </Grid>
                </Grid>
                </Box>
            </div>
          </div>
          <div id="keywordSearch" class="nav-section">
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Enter keywords..."
                inputProps={{ 'aria-label': 'searchValue' }}
                value={searchValue}
                id="search-keyword"
                onChange={(e) => setSearchvalue(e.target.value)}
              /> 
            </Search>
          </div>
          <div id="locationSearch" class="nav-section">
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Enter keywords..."
                inputProps={{ 'aria-label': 'searchValue2' }}
                value={searchValue2}
                id="search-keyword"
                onChange={(e) => setSearchvalue2(e.target.value)}
              /> 
            </Search>
          </div>
          <div id="goButton" class="nav-section">
            <Button variant="contained" color="error" id="search-button" fullWidth="true" onClick={handleSearch}>GO</Button>
          </div>
      </nav>
    </Box>
    <div class="results-bar" style={{ overflow: "scroll" }}>
      <VideoCard video = {videoData.video1}/>
      <VideoCard video = {videoData.video2}/>
      <VideoCard video = {videoData.video3}/>
      <VideoCard video = {videoData.video4}/>
      <VideoCard video = {videoData.video5}/>
    </div>
    <MapContainer 
      zoomControl={false}  
      style={{ position: "absolute", zIndex: 1, top: "calc(144px - 6px)", bottom: "20px", left: "calc(20% + 5px)", right: "8px",}} 
      center={[51.505, -0.09]} 
      zoom={5} 
      scrollWheelZoom={true}  
      whenReady={(map) => {
        console.log(map);
        map.target.on("click", function (e) {
          console.log(e.latlng);
          assignCoord(e); 
        });
      }}
    >
    <TileLayer 
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <ZoomControl position="bottomright"/>
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90} draggable={true}>
        <span>
          {position.lat + ", " + position.lng}
        </span>
      </Popup>
    </Marker>
    </MapContainer>
  </div>
  );
}