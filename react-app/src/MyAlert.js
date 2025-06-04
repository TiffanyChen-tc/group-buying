import React from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function AlertSuccess(message) {
      Swal.fire({
        icon: 'success',
        title: 'success',
        text: message,
      });
  };

  function AlertError(message) {
      Swal.fire({
        icon: 'error',
        title: 'error',
        text: message, 
      });
  };
  
  export { AlertSuccess, AlertError };