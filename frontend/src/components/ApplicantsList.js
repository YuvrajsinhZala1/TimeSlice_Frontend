import React from 'react';
import ApplicationCard from './ApplicationCard';

const ApplicantsList = ({ task, onRespondToApplication }) => {
  if (!task.applicants || task.applicants.length === 0) {
    return (
      <div className="card text-center">
        <h3>No Applications Yet</h3>
        <p>No one has applied for this task yet. Make sure your task description is clear and attractive!</p>
      </div>
    );
  }

  const pendingApplications = task.applicants.filter(app => app.status === 'pending');
  const respondedApplications = task.applicants.filter(app => app.status !== 'pending');

  return (
    <div>
      {pendingApplications.length > 0 && (
        <div className="mb-2">
          <h3>Pending Applications ({pendingApplications.length})</h3>
          <div className="card-grid">
            {pendingApplications.map(application => (
              <ApplicationCard
                key={application._id}
                application={application}
                onRespond={onRespondToApplication}
                showResponseOptions={true}
              />
            ))}
          </div>
        </div>
      )}

      {respondedApplications.length > 0 && (
        <div className="mb-2">
          <h3>Previous Applications ({respondedApplications.length})</h3>
          <div className="card-grid">
            {respondedApplications.map(application => (
              <ApplicationCard
                key={application._id}
                application={application}
                showResponseOptions={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;