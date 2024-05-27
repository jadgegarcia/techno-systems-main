import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CriteriasService } from '../services';
import ActivityCriteriasService from '../services/ActivityCriteriasService';

const useActivityCriteria = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activityCriterias, setActivityCriterias] = useState([]);

  useEffect(() => {
    const get = async () => {
      let responseCode;
      let retrievedActivityCriterias;

      try {
        const res = await ActivityCriteriasService.all();

        responseCode = res?.status;
        retrievedActivityCriterias = res?.data;

        console.log(retrievedActivityCriterias);
      } catch (error) {
        responseCode = error?.response?.status;
      }

      switch (responseCode) {
        case 200:
            setActivityCriterias(retrievedActivityCriterias);
          break;
        case 404:
        case 500:
          navigate('/classes');
          break;
        default:
      }

      setIsLoading(false);
    };

    get();
  }, []);

  const getActivityCriteriaById = async (id) => {
    let responseCode;
    let activityCriteria;
    try {
      const res = await ActivityCriteriasService.get(id);

      responseCode = res?.status;
      activityCriteria = res?.data;
    } catch (error) {
      responseCode = error?.response?.status;
    }

    switch (responseCode) {
      case 200:
        return { success: true, data: activityCriteria };
      case 400:
      case 404:
      case 500:
      default:
    }
  };

  return { isLoading, activityCriterias, getActivityCriteriaById };
};

export default useActivityCriteria;
