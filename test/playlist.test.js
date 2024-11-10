import { should as _should, expect as _expect, use } from 'chai';
import chaiHttp from 'chai-http';
import server from '../index.js';
const should = _should();
const expect = _expect;
import request from 'supertest';

use(chaiHttp);

describe('Playlist API', () => {
  let token = null;
  let playlist_id = null;
  let track_id = '3zmwONxswBAzGwExPugSLN';

  before((done) => {
    request(server)
      .post('/api/v1/account/login')
      .send({ username: 'thuthuy', password: 'thuy' })
        .end((err, res) => {
            token = res.body.token;
            done();
        });

    });

    it('should create a new playlist', (done) => {
      request(server)
        .post('/api/v1/playlist/create')
        .set('token', 'Bearer ' + token)
        .send({ name: 'My playlist', description: 'My favorite songs' })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message').to.equal('Playlist created');
        //   expect(res.body).to.have.property('playlist_id');
          playlist_id = res.body.playlist_id;
          done();
        });
    });

    it('should get all playlists', (done) => {
      request(server)
        .get('/api/v1/playlist/all')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('should get a playlist by id', (done) => {
      request(server)
        .get('/api/v1/playlist/' + playlist_id)
        .set('token', 'Bearer ' + token)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('should update a playlist', (done) => {
      request(server)
        .put('/api/v1/playlist/update/' + playlist_id)
        .set('token', 'Bearer ' + token)
        .send({ name: 'My updated playlist', description: 'My favorite songs' })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message').to.equal('Playlist updated');
          done();
        });
    });

    it('should get all playlists by creator', (done) => {
        request(server)
            .get('/api/v1/playlist/creator')
            .set('token', 'Bearer ' + token)
            .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
            done();
            });
        });

    it('should add a track to a playlist', (done) => {
        request(server)
            .post('/api/v1/playlist/' + playlist_id + '/track')
            .set('token', 'Bearer ' + token)
            .send({ track_id: track_id })
            .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property("message").to.equal('Track added to playlist');
            done();
            });
        });

    it('should get all tracks in a playlist', (done) => {
        request(server)
            .get('/api/v1/playlist/' + playlist_id + '/tracks')
            .set('token', 'Bearer ' + token)
            .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
            done();
            });
        });

    // it('should change track order in a playlist', (done) => {
    //     request(server)
    //         .patch('/api/v1/playlist/' + playlist_id + '/order')
    //         .set('token', 'Bearer ' + token)
    //         .send({ track_id: track_id, new_order: 1 })
    //         .end((err, res) => {
    //         expect(res.statusCode).to.equal(200);
    //         expect(res.body).to.have.property("message").to.equal('Track order changed successfully');
    //         done();
    //         });
    //     });

    it('should delete a track from a playlist', (done) => {
        request(server)
            .delete('/api/v1/playlist/' + playlist_id + '/track')
            .set('token', 'Bearer ' + token)
            .send({ track_id: track_id})
            .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property("message").equal('Track deleted from playlist');
            done();
            });
        });

    it('should delete a playlist', (done) => {
        request(server)
            .delete('/api/v1/playlist/delete/' + playlist_id)
            .set('token', 'Bearer ' + token)
            .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property("message").to.equal('Playlist deleted');
            done();
            });
        });
});