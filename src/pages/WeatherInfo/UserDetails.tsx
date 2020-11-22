import React, { FunctionComponent, useState, useEffect } from 'react';
import { Prompt } from 'react-router-dom';

import Button from '../../components/Button';
import Favorite from '../../components/Favorite';
import Input from '../../components/Input';
import { getUserData, saveUserData } from '../../shared/actions';
import { showNotification } from '../../shared/notifier';

interface Props {
  cityName: string;
}

const UserDetails: FunctionComponent<Props> = ({ cityName }) => {
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const initialValues = getUserData(cityName);
    if (initialValues) {
      setIsFavorite(initialValues.isFavorite);
      setNotes(initialValues.notes);
    }
  }, [cityName]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    }
  }, [hasUnsavedChanges]);

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNotes(value);
    setHasUnsavedChanges(true);
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveUserData({ cityName, isFavorite, notes });
    showNotification('Notes saved!', 'success', 3000);
    setHasUnsavedChanges(false);
  };

  const handleIsFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    saveUserData({ cityName, isFavorite: checked, notes });
    setIsFavorite(checked);
    showNotification(checked ? 'Marked as favorite!' : 'Removed from favorites!', 'success', 2000);
  };

  return (
    <div className="user-details">
      <form onSubmit={handleSubmit}>
        <div className="notes-container">
          <Input
            name="notes"
            type="textarea"
            className="notes"
            label="Notes"
            value={notes}
            onChange={handleNotesChange}
            rows={10}
          />
        </div>
        <div className="actions">
          <Button type="submit" onClick={() => {}}>
            Save
          </Button>
          <Favorite
            name="favoriteCity"
            checked={isFavorite}
            onChange={handleIsFavoriteChange}
            label={isFavorite ? 'Remove from Favorites' : 'Mark as Favorite' }
          />
        </div>
      </form>
      <Prompt
        when={hasUnsavedChanges}
        message="You have unsaved changes, are you sure you want to leave?"
      />
    </div>
  );
};

export default UserDetails;
