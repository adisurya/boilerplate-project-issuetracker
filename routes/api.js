'use strict';
const express = require('express');

const Issue = require('../controllers/Issue');

module.exports = function (app) {
  const issue = new Issue();
  app.use(express.urlencoded({extended: true}));

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const issues = issue.get(project, req.query);
      res.json(issues);
    })
    
    .post(function (req, res){
      try {
        let project = req.params.project;
        const data = req.body;
  
        const currentIssue = issue.add(project, data);
        res.json(currentIssue);  
      } catch (e) {
        res.json({ error: e.message });
      }
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const id = req.body._id;

      if (!id) {
        res.json({ error: 'missing _id' });
        return;
      }

      try {
        const updated = issue.update(project, id, req.body);
        if (updated) {
          res.json({ result: 'successfully updated', _id: id });
        }
      } catch (e) {
        res.json({ error: e.message, _id: id });

      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const id = req.body._id;

      if (!id) {
        res.json({ error: 'missing _id' });
        return;
      }
      
      try {
        const updated = issue.delete(project, id);
        if (updated) {
          res.json({ result: 'successfully deleted', _id: id });
        }
      } catch (e) {
        res.json({ error: e.message, _id: id });

      }

    });
    
};
