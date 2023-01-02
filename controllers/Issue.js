const uniqid = require('uniqid');

module.exports = function () {
    this.data = {};
     
    this.add = function (projectName, issue) {
        if (!issue.issue_title || !issue.issue_text || !issue.created_by) {
            throw new Error('required field(s) missing');
        }

        issue._id = uniqid();
        issue.created_on = new Date();
        issue.updated_on = new Date();
        issue.assigned_to = issue.assigned_to || '';

        let open = true;
        if (issue.open === false) {
            open = false;
        }
        issue.open = open;

        issue.status_text = issue.status_text || '';

        const project = this.data[projectName] || {issues: []};
        project.issues.push(issue);

        this.data[projectName] = project;

        return issue;
    };

    this.get = function (projectName, filters) {
        const project = this.data[projectName] || {issues: []};

        let issues = project.issues.filter((issue) => {
            let ok = true;
            if (filters) {
                if (filters._id) {
                    ok = ok && (filters._id === issue._id);
                }

                if (filters.issue_title) {
                    ok = ok && (
                        filters.issue_title.toLowerCase() === issue.issue_title.toLowerCase()
                    );
                }

                if (filters.issue_text) {
                    ok = ok && (
                        filters.issue_text.toLowerCase() === issue.issue_text.toLowerCase()
                    );
                }

                if (filters.created_by) {
                    ok = ok && (
                        filters.created_by.toLowerCase() === issue.created_by.toLowerCase()
                    );
                }

                if (filters.assigned_to) {
                    ok = ok && (
                        filters.assigned_to.toLowerCase() === issue.assigned_to.toLowerCase()
                    );
                }

                if (filters.status_text) {
                    ok = ok && (
                        filters.status_text.toLowerCase() === issue.status_text.toLowerCase()
                    );
                }

                if (filters.created_on) {
                    const createdOn = new Date(filters.created_on);
                    ok = ok && (
                        createdOn === issue.created_on
                    );
                }

                if (filters.updated_on) {
                    const updatedOn = new Date(filters.updated_on);
                    ok = ok && (
                        updatedOn === issue.updated_on
                    );
                }

                if (typeof filters.open !== 'undefined') {
                    let open = true; 
                    if (filters.open === '' || filters.open === '0' || filters.open === 'false') {
                        open = false;
                    }
                    ok = ok && (
                        open === issue.open
                    );
                }

            }
            return ok;
        });

        return issues;
    }

    this.update = function (projectName, id, params) {
        if (!id) {
            throw new Error('missing _id');
        }
        const project = this.data[projectName];
        if (!project) {
            throw new Error('could not update');
        }
        const issues = project.issues;
        const index = issues.reduce((acc, cur, index) => {
            if (cur._id === id) {
                acc = index;
            }
            return acc;
        }, null);

        if (index === null) {
            throw new Error('could not update');
        }

        let fieldUpdates = 0;

        if (params.issue_title) {
            this.data[projectName].issues[index].issue_title = params.issue_title;
            fieldUpdates++;
        }

        if (params.issue_text) {
            this.data[projectName].issues[index].issue_text = params.issue_text;
            fieldUpdates++;
        }

        if (params.created_by) {
            this.data[projectName].issues[index].created_by = params.created_by;
            fieldUpdates++;
        }

        if (params.assigned_to) {
            this.data[projectName].issues[index].assigned_to = params.assigned_to;
            fieldUpdates++;
        }

        if (params.status_text) {
            this.data[projectName].issues[index].status_text = params.status_text;
            fieldUpdates++;
        }
        if (typeof params.open !== 'undefined') {
            let open = true; 
            if (
                params.open === '' ||
                params.open === '0' ||
                params.open === 'false' ||
                params.open === false ||
                params.open === 0 ||
                params.open === null
            ) {
                open = false;
            }

            this.data[projectName].issues[index].open = open;
            fieldUpdates++;
        }

        if (fieldUpdates === 0) {
            throw new Error('no update field(s) sent');   
        } else {
            this.data[projectName].issues[index].updated_on = new Date();   
        }

        return true;
    }

    this.delete = function (projectName, id) {
        if (!id) {
            throw new Error('missing _id');
        }
        const project = this.data[projectName];
        if (!project) {
            throw new Error('could not delete');
        }
        const issues = project.issues;
        const index = issues.reduce((acc, cur, index) => {
            if (cur._id === id) {
                acc = index;
            }
            return acc;
        }, null);

        if (index === null) {
            throw new Error('could not delete');
        }

        delete this.data[projectName].issues[index];

        return true;
    }
}