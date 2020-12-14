import React, { FunctionComponent, useState, useEffect } from 'react';
import { Prompt } from 'react-router-dom';
import cx from 'classnames';

import Button from '../../components/Button';
import Input from '../../components/Input';
import DialogOpener, { OpenFunction, CloseFunction } from '../../components/DialogOpener';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { getUserData, saveUserData } from '../../shared/actions';
import { showNotification } from '../../shared/notifier';

interface Props {
  cityName: string;
}

const NotesSection: FunctionComponent<Props> = ({ cityName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const initialValues = getUserData(cityName);
    if (initialValues) {
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

  const handleAddEditNotes = () => {
    setIsEditing(true);
  };

  const handleDeleteNotes = (close: CloseFunction) => {
    const userData = getUserData(cityName);
    const isFavorite = (userData && userData.isFavorite) || false;
    setNotes('');
    saveUserData({ cityName, isFavorite, notes: '' });
    showNotification('Notes deleted!', 'success', 3000);
    close();
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNotes(value);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = () => {
    const userData = getUserData(cityName);
    const isFavorite = (userData && userData.isFavorite) || false;
    saveUserData({ cityName, isFavorite, notes });
    showNotification('Notes saved!', 'success', 3000);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    const initialValues = getUserData(cityName);
    if (initialValues) {
      setNotes(initialValues.notes);
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="notes-section">
      <div className="notes-section-content">
        <div className="notes-header">
          <h2>Notes</h2>
          {
            notes && !isEditing && (
              <div className="actions">
                <Button onClick={handleAddEditNotes}>Edit</Button>
                <DialogOpener
                  component={(open: OpenFunction) => 
                    <Button variant="outlined" onClick={() => open()}>Delete</Button>
                  }
                >
                  {
                    (close: CloseFunction) => (
                      <ConfirmationDialog
                        title="Are you sure?"
                        onCancel={() => close()}
                        onConfirm={() => handleDeleteNotes(close)}
                      >
                        {`This operation will delete notes for ${cityName}. \n Are you sure you want to delete it?`}
                      </ConfirmationDialog>
                    )
                  }
                </DialogOpener>
              </div>
            )
          }
          {
            isEditing && (
              <div className="actions">
                <Button variant="outlined" type="button" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                  Save
                </Button>
              </div>
            )
          }
        </div>
        <div className="notes-content">
          {
            !notes && !isEditing
              ? (
                <div className="no-notes">
                  <span>No Notes yet!</span>
                  <Button onClick={handleAddEditNotes}>Add Notes</Button>
                </div>
              )
              : (
                <div className="notes-container">
                  <Input
                    name="notes"
                    type="textarea"
                    className={cx('notes', { inactive: !isEditing })}
                    readOnly={!isEditing}
                    value={notes}
                    onChange={handleNotesChange}
                    rows={10}
                  />
                </div>
              )
          }
        </div>
      </div>
      <Prompt
        when={hasUnsavedChanges}
        message="You have unsaved changes, are you sure you want to leave?"
      />
    </div>
  );
};

export default NotesSection;
