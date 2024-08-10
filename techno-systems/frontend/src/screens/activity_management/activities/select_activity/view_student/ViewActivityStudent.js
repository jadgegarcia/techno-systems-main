import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiTrash, FiEdit2 } from 'react-icons/fi';
import { useActivities, useActivity, useActivityComments, useWorks } from '../../../../../hooks';
import {
  CreateEvaluationPopup,
  CreateCommentPopup,
  UpdateActivityPopup,
  UpdateCommentPopup,
} from '../../../../../components/modals/teacher_views';
import { ViewWorkPopup, EditWorkPopup } from '../../../../../components/modals/student_views';
import { WorkCard } from '../../../../../components/cards/work_cards';
import useActivityCriteria from '../../../../../hooks/useActivityCriteria';

const ViewActivityStudent = () => {
  const { classId } = useOutletContext();
  const { activityId, teamId } = useParams();
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState(null);

  const { isRetrieving, activity } = useActivity(classId, teamId, activityId);
  const { comments } = useActivityComments(activityId);
  const [comment, setComment] = useState(null);
  const [activityComments, setActivityComments] = useState([]);
  const [submitted, setSubmitted] = useState(null);


  
    // -------------------- START CRITERIA ------------------------------
    const [activityCriteriaOptions, setActivityCriteriaOptions] = useState([]);
    const { getActivityCriteriaById } = useActivityCriteria(activityId);
    const [activityCriteriaNames, setActivityCriteriaNames] = useState([]);
  // -------------------- END CRITERIA ------------------------------

  console.log("HEREEEEE:");

  

  activityComments.forEach(commentNi => {
    // Extract the value associated with the key 'overall_feedback'
    const overallFeedbackMatch = commentNi.comment.match(/'Overall Feedback': '([^']+)'/);
    
    // Check if the match was found
    if (overallFeedbackMatch && overallFeedbackMatch[1]) {
        console.log(overallFeedbackMatch[1]);
    } else {
        console.log("No overall_feedback found in the comment.");
    }
  });

  useEffect(() => {
    if (activity) {
      const temp = { ...activity };
      const activityCriterias = { ...activity.activityCriteria_id };
      setActivityData(temp);
      setSubmitted(!temp.submission_status);
      setActivityCriteriaOptions(activityCriterias);
    }
  }, [activity]);

  useEffect(() => {
    // Extract keys from activityCriteriaOptions
    const keys = Object.keys(activityCriteriaOptions);
      
    // Fetch activity criteria for each key
    Promise.all(keys.map(key => getActivityCriteriaById(activityCriteriaOptions[key])))
      .then(responses => {
        console.log(responses); // Log the array of responses
        // Iterate over each response to access individual response data
        responses.forEach(response => {
          setActivityCriteriaNames(prevNames => [...prevNames, response.data.name]);
          console.log(response.data); // Log the data property of each response
          // Further access specific properties as needed
        });
      })
      .catch(error => {
        console.error(error);
      });
  }, [activityCriteriaOptions]);

  console.log("names: ", activityCriteriaNames);

  useEffect(() => {
    if (activityData && comments) {
      setActivityComments(comments);
    }
  }, [activityData, comments]);

  const getFormattedDate = () => {
    if (activityData?.due_date) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const date = new Date(activityData.due_date);
      return date.toLocaleDateString(undefined, options);
    }
    return 'None';
  };

  //  Submit Activity
  const submitAct = useActivity(classId, teamId, activityId);

  const handleSubmit = async (e) => {
    setSubmitted(true);
    const data = {
      submission_status: submitted,
    };
    submitAct.submitActivity(classId, teamId, activityId, data);
    window.location.reload();
  };

  // Edit/Delete Work

  const [showAddWorkModal, setShowAddWorkModal] = useState(false);

  const handleAddWork = async (e) => {
    setShowAddWorkModal(true);
  };

  const [workData, setWorkData] = useState(null);
  const fetchData = useWorks(activityId);
  const fetchWorkDataPromise = fetchData.getWorksByActivity(); // This returns a Promise

  useEffect(() => {
    // const fetchData = useWorks(activityId);

    fetchWorkDataPromise.then((resolvedData) => {
      setWorkData(resolvedData);
    });

    // If fetchData.getWorksByActivity() returns a function to cleanup, use it in the return statement
    return () => {
      // Cleanup logic (if needed)
    };
  }, []);

  // Edit Work
  const [editWorkData, setEditWorkData] = useState(null);
  const [showEditWorkModal, setShowEditWorkModal] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isEditWorkClickable, setIsEditWorkClickable] = useState(false);

  

  // Select a work
  const handleSelectWork = (work) => {
    setSelectedWork(work);
    setSelectedWorkId(work.id);
  };

  const handleEditWork = (work) => {
    if (work) {
      setEditWorkData(work); // Assuming setEditWorkData is a state updater function
      setSelectedWork(work);
      setSelectedWorkId(work.id); // Set the selected work ID
      setShowEditWorkModal(true);
    }
  };

  // Function to handle submitting the edited work
  const handleEditWorkSubmit = async (editedWorkData) => {
    // Implement the logic to update the work data
    // You may need to use the appropriate hook or API call here
    setShowEditWorkModal(false);
  };

  return (
    <div className="container-md">
      <div className="container-md d-flex flex-column gap-3 mt-5 pr-3 pl-3">
        <div className="d-flex flex-row justify-content-between">
          <div className="d-flex flex-row align-items-center gap-3">
            <span
              className="nav-item nav-link"
              onClick={() => {
                navigate(-1);
              }}
            >
              <FiChevronLeft />
            </span>

            <h4 className="fw-bold m-0">{activityData ? `${activityData.title}` : 'Loading...'}</h4>
          </div>

          <div className="d-flex flex-row gap-3">
          {((activityData?.evaluation === 0) ||(activityData?.evaluation === null)) && (
              <button
                className="btn btn-outline-secondary btn-block fw-bold bw-3 m-0"
                onClick={handleSubmit}
              >
                {submitted ? 'Submit Activity' : 'Unsubmit Activity'}
              </button>
            )
          }
          </div>
        </div>

        <hr className="text-dark" />

        <div>
          {!isRetrieving && activityData ? (
            <div className="d-flex flex-row justify-content-between ">
              <div>
                <p>Due: {getFormattedDate()}</p>
                <p>Description:</p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: activityData?.description.replace(/\n/g, '<br>'),
                  }}
                />
              </div>
              <div>
                <p>
                  Evaluation: {activityData?.evaluation ?? 0} / {activityData.total_score}
                </p>
              </div>
            </div>
          ) : (
            <p>Loading class details...</p>
          )}
        </div>

        {/* ----------------------- START CRITERIA ----------------------------- */}

        <div className="d-flex flex-column gap-3 mt-4">
          <h5 className="fw-bold">Criterias</h5>

          {activityCriteriaNames && activityCriteriaNames.length > 0 ? (
            activityCriteriaNames.map((_criteriaOptions) => (
              <div
                className="d-flex flex-row justify-content-between align-items-center p-3 border border-dark rounded-3 mb-0"
                key={_criteriaOptions.id}
              >
                <div className="b-0 m-0">
                  <div className="d-flex flex-row gap-2">
                    <div className="fw-bold activity-primary">
                      {/* {_comment.user.first_name} {_comment.user.last_name} */}
                      {_criteriaOptions}
                    </div>
                  </div>
                  {/* {_comment.comment} */}
                </div>
                {/* <div className="d-flex flex-row gap-3 fw-bold">
                  <button
                    className="nav-item nav-link text-danger d-flex align-items-center"
                    onClick={(e) => handleCommentDelete(e, _comment.id)}
                  >
                    <FiTrash />
                  </button>
                </div> */}
              </div>
            ))
          ) : (
            <p>No criterias available</p>
          )}
        </div>

        {/* ----------------------- END CRITERIA ------------------------------- */}

        <div className="d-flex flex-column gap-3 mt-4">
          <h5 className="fw-bold">Works</h5>

          {workData ? (
            workData.map((work) => (
              <WorkCard
                key={work.id}
                workData={work}
                isClickable={!showEditWorkModal}
                onEditClick={() => handleSelectWork(work)}
                isSelected={selectedWork && selectedWork.id === work.id}
              />
            ))
          ) : (
            <p>No work data available.</p>
          )}
        </div>

        <div className="d-flex flex-row gap-3">
          {((activityData?.evaluation === 0) || (activityData?.evaluation === null)) && (
              <button className="btn btn-outline-secondary bw-3 mt-4" onClick={handleAddWork}>
              Add Work
              </button>
          )}
          
          {selectedWork && (
            <button
              className="btn btn-primary bw-3 mt-4"
              onClick={() => handleEditWork(selectedWork)}
            >
              Edit Work
            </button>
          )}
        </div>
        {workData && (
          <ViewWorkPopup
            show={showAddWorkModal}
            handleClose={() => setShowAddWorkModal(false)}
            workData={workData} // Pass any necessary data
            id={activityId}
            // onSubmit={handleSubmitWork} // Define a function to handle work submission
          />
        )}

        <div className="d-flex flex-row gap-3" />

        <hr className="text-dark" />

        <div className="d-flex flex-column gap-3">
          <p>Comment</p>

          {activityComments && activityComments.length > 0 ? (
            activityComments.map((_comment) => (
              <div
                className="d-flex flex-row justify-content-between p-3 border border-dark rounded-3 "
                key={_comment.id}
              >
                <div className="b-0 m-6" style={{ height: '150px', color: 'black' }}>
                  <div className="d-flex flex-row gap-2">
                    <div className="fw-bold activity-primary">
                      Feedback
                    </div>
                  </div>
                  {_comment.comment.match(/'Overall Feedback':\s*"([^"]+)"/)?.[1]}
                </div>
              </div>
            ))
          ) : (
            <p>No comments available</p>
          )}
        </div>
      </div>

      {showEditWorkModal && (
        <EditWorkPopup
          show={showEditWorkModal}
          handleClose={() => setShowEditWorkModal(false)}
          editWorkData={selectedWork}
          onSubmit={handleEditWorkSubmit}
          id={activityId}
          workId={selectedWorkId}
        />
      )}
    </div>
  );
};

export default ViewActivityStudent;
