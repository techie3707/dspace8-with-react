import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { addGroup, GroupPayload } from "../../api/group";


interface AddGroupProps {
  open: boolean;
  onClose: () => void;
  onGroupAdded: () => void;
}

const AddGroup = ({ open, onClose, onGroupAdded }: AddGroupProps) => {
  const [groupName, setGroupName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSave = async () => {
    const payload: GroupPayload = {
      name: groupName,
      metadata: {
        "dc.description": [{ value: description }],
      },
    };

    const success = await addGroup(payload);
    if (success) {
      onGroupAdded(); 
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Group</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Group name *"
          variant="outlined"
          margin="dense"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          margin="dense"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGroup;
