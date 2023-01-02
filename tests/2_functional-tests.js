const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let issue = null;

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/apitest')
    .send({
        issue_title: 'test title',
        issue_text: 'test text body',
        created_by: 'tester',
        assigned_to: 'joe',
        status_text: 'open',
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.issue_title, 'test title');
      assert.equal(res.body.issue_text, 'test text body');
      assert.equal(res.body.created_by, 'tester');
      assert.equal(res.body.assigned_to, 'joe');
      assert.equal(res.body.status_text, 'open');
      assert.isNotNull(res.body._id);
      issue = res.body;
      done();
    });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/apitest')
    .send({
        issue_title: 'test title required',
        issue_text: 'test text body required',
        created_by: 'tester',
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.issue_title, 'test title required');
      assert.equal(res.body.issue_text, 'test text body required');
      assert.equal(res.body.created_by, 'tester');
      assert.equal(res.body.assigned_to, '');
      assert.equal(res.body.status_text, '');
      assert.isNotNull(res.body._id);

      done();
    });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .post('/api/issues/apitest')
    .send({
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.error, 'required field(s) missing');
      assert.isNotNull(res.body._id);

      done();
    });
  });

  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest')
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.equal(res.body.length, 2);

      done();
    });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest?issue_title=test title')
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.equal(res.body.length, 1);
      const issue = res.body[0];
      assert.equal(issue.issue_title, 'test title');

      done();
    });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    chai
    .request(server)
    .get('/api/issues/apitest?issue_title=test title&open=true')
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.equal(res.body.length, 1);
      const issue = res.body[0];
      assert.equal(issue.issue_title, 'test title');

      done();
    });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
        _id: issue._id,
        issue_text: 'issue text updated',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body._id, issue._id);
    assert.equal(res.body.result, 'successfully updated');

    const resUpdated = await chai
    .request(server)
    .get('/api/issues/apitest?_id=' + issue._id);
    issueUpdated = resUpdated.body[0];

    assert.notEqual(issue.updated_on, issueUpdated.updated_on);
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
        _id: issue._id,
        assigned_to: 'joko',
        status_text: 'closed',
        open: false,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body._id, issue._id);
    assert.equal(res.body.result, 'successfully updated');

    const resUpdated = await chai
    .request(server)
    .get('/api/issues/apitest?_id=' + issue._id);
    issueUpdated = resUpdated.body[0];

    assert.notEqual(issue.updated_on, issueUpdated.updated_on);
    assert.equal(issueUpdated.assigned_to, 'joko');
    assert.equal(issueUpdated.status_text, 'closed');
    assert.equal(issueUpdated.open, false);

  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
        assigned_to: 'joko',
        status_text: 'closed',
        open: false,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'missing _id');
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
      _id: issue._id,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'no update field(s) sent');
    assert.equal(res.body._id, issue._id);

  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .put('/api/issues/apitest')
    .send({
      _id: 'xyz',
      assigned_to: 'joko',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'could not update');
    assert.equal(res.body._id, 'xyz');

  });

  test('Delete an issue: DELETE request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .delete('/api/issues/apitest')
    .send({
      _id: issue._id,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'successfully deleted');
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .delete('/api/issues/apitest')
    .send({
      _id: 'xyz',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'could not delete');
    assert.equal(res.body._id, 'xyz');
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', async () => {
    const res = await chai
    .request(server)
    .delete('/api/issues/apitest')
    .send({
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'missing _id');
  });


});
