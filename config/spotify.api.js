import express from 'express';
import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';

dotenv.config();

const app = express();
const port = 3000;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.get('/login', (req, res) => {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    // Sử dụng mã ủy quyền để lấy access token
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        // Thiết lập access token và refresh token
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log('Access token:', accessToken);
        console.log('Refresh token:', refreshToken);

        res.send('Login successful!');

        // Thiết lập interval để làm mới access token
        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const newAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(newAccessToken);
            console.log('Access token refreshed:', newAccessToken);
        }, expiresIn / 2 * 1000); // Làm mới trước khi hết hạn
    }).catch(error => {
        console.error('Error getting Tokens:', error);
        res.send('Error getting tokens');
    });
});


app.get('/me', (req, res) => {
    spotifyApi.getMe().then(data => {
      res.json(data.body);
    }).catch(err => {
      console.error('Error getting user information:', err);
      res.send('Error getting user information.');
    });
});


app.get('/search', (req, res) => {
    const { q } = req.query;
    spotifyApi.searchTracks(q).then(searchData => {
        const trackUri = searchData.body.tracks.items[0].uri;
        res.send({ uri: trackUri });
    }).catch(err => {
        console.error('Search Error:', err);
        res.send('Error occurred during search');
    });
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});



// spotifyApi.clientCredentialsGrant().then(data => {
//     spotifyApi.setAccessToken(data.body['access_token']);
  
//     const trackId = '72YmbRPOa2DZKe4HzdFG9B';
//     spotifyApi.getTrack(trackId).then(trackData => {
//       console.log('Track Name:', trackData.body.name);
//       console.log('Artists:', trackData.body.artists.map(artist => artist.name).join(', '));
//       console.log('Album:', trackData.body.album.name);
//       console.log('Popularity:', trackData.body.popularity);
//     }).catch(err => {
//       console.error('Error retrieving track info:', err);
//     });
//   }).catch(err => {
//     console.error('Error getting access token:', err);
//   });

spotifyApi.clientCredentialsGrant().then(data => {
    spotifyApi.setAccessToken(data.body['access_token']);

    const userId = '31zzrjtodekmi33b3xl6ldkdxgbi';
    spotifyApi.getUser(userId).then(userData => {
      console.log('User Name:', userData.body.display_name);
      console.log('Followers:', userData.body.followers.total);
      console.log('User Type:', userData.body.type);
      console.log('Profile Image:', userData.body.images.length > 0 ? userData.body.images[0].url : 'No image');
    }).catch(err => {
      console.error('Error retrieving user info:', err);
    });
}).catch(err => {
    console.error('Error getting access token:', err);
});



