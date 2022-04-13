import React from 'react'
import { Button, Link} from '@material-ui/core';
import { useNavigate} from "react-router-dom"

function AddButton ({}) {
  let navigate = useNavigate();
  let leaveButtonClicked = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'}
    };
    fetch('/api/leave_room', requestOptions).then((_response) => {
      navigate('/');
    });
  }

  return (
    <Button color="secondary" variant="contained" to="/" onClick={leaveButtonClicked}>
      Sair da sala
    </Button>
  )
}

export default AddButton

