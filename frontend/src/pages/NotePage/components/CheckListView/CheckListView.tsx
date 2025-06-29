import React, { useState } from "react";
import { useCheckItems } from "../../hooks/useCheckItems";
import styles from "./CheckListView.module.css";
import { Note } from "../../api/responses";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

type CheckListViewProps = {
  note: Note;
};

export const CheckListView: React.FC<CheckListViewProps> = ({ note }) => {
  const [newItem, setNewItem] = useState("");
  const { noteState, error, addItem, toggleItem, deleteItem, updateItem } = useCheckItems(note);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await addItem(newItem.trim());
      setNewItem("");
    } catch (err) {
      // You might want to show an error toast here
      console.error("Failed to add item:", err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleItem(id, noteState);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleEdit = async (id: number, name: string) => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  return (
    <Box className={styles.pageWrapper}>
      <Paper elevation={3} className={styles.container} sx={{ p: 2, mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box className={styles.addItemContainer} sx={{ mb: 2, gap: 1 }}>
          <TextField
            className={styles.addInput}
            variant="standard"
            fullWidth
            placeholder="+ Add Task"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, mr: 1 }}
          />
          <Button
            className={styles.addButton}
            variant="contained"
            color="primary"
            onClick={handleAdd}
            sx={{ minWidth: 80 }}
          >
            Add
          </Button>
        </Box>
        <List className={styles.list}>
          {noteState.checkItems?.map((item) => (
            <ListItem
              key={item.id}
              className={styles.listItem}
              sx={{
                background: item.doneDate ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                py: 0.5,
                px: 0,
              }}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              }
              disablePadding
            >
              <Checkbox
                checked={!!item.doneDate}
                onChange={() => handleToggle(item.id)}
                sx={{ mr: 1 }}
                color="primary"
              />
              <TextField
                value={item.name}
                onChange={(e) => handleEdit(item.id, e.target.value)}
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  style: {
                    textDecoration: item.doneDate ? 'line-through' : undefined,
                    color: item.doneDate ? 'var(--color-text-secondary)' : 'var(--color-text)',
                  },
                }}
                sx={{ flex: 1, background: 'transparent' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};
