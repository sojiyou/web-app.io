document.addEventListener('DOMContentLoaded', () => {
   const userForm = document.getElementById('userForm');
   const userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];

   function getUser() {
      fetch('/users')
         .then(response => response.json())
         .then(users => {
            userTable.innerHTML = '';

            users.forEach(user => {
               const row = userTable.insertRow();
               row.innerHTML = `
                  <td>${user.id}</td>
                  <td>${user.name}</td>
                  <td>${user.date}</td>
                  <td>
                     <button class="update-btn" data-id="${user.id}">Update</button>
                     <button class="delete-btn" data-id="${user.id}">Delete</button>
                  </td>
               `;

               //---------->Attach event listeners to update and delete buttons
               const updateBtn = row.querySelector('.update-btn');
               const deleteBtn = row.querySelector('.delete-btn');

               //----------> Update button event listener
               updateBtn.addEventListener('click', () => {
                  const name = prompt("Enter new name:", user.name);
                  const date = prompt("Enter new date:", user.date);
                  if (name && date) {
                     fetch(`/users/${user.id}`, {
                        method: 'PUT',
                        headers: {
                           'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({name, date}),
                     })
                     .then(response => response.json())
                     .then(updatedUser => {
                        getUser();
                     })
                     .catch(error => console.error('Error updating user:', error));
                  }
               });

               //----------> Delete button event listener
               deleteBtn.addEventListener('click', () => {
                  if (confirm(`Are you sure you want to delete user with ID: ${user.id}?`)) {
                     fetch(`/users/${user.id}`, {
                        method: 'DELETE',
                     })
                     .then(() => {
                        getUser();
                     })
                     .catch(error => console.error('Error deleting user:', error));
                  }
               });
            });
         })
         .catch(error => console.error('Error:', error));
   }

   //----------> Handle form submission for adding new users
   userForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const date = document.getElementById('date').value;

      fetch('/users', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({name, date}),
      })
      .then(response => response.json())
      .then(user => {
         userForm.reset();
         getUser();
      })
      .catch(error => console.error('Error adding user:', error));
   });

   getUser();
});
