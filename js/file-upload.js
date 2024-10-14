const uploadArea = document.querySelector('#upload-area');
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'video/mp3', 'application/illustrator', 'application/msword', 'application/vnd.ms-powerpoint'];
const fileNameContainer = document.querySelector('#file-name-container')
const browseBtn = document.querySelector('.browse');
const fileInput = document.querySelector('#file-input');
const submitBtn = document.querySelector('#submit-btn');
const alertContainer = document.querySelector('#alert-container');
const uploadedFileContainer = document.querySelector('.uploaded-file-container');
const loader = document.getElementById('loader');

let filesToUpload = [];
let uploadedFiles = []; 

// check file follows valid criteria: type, size, number.
function validType(files) {
    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            showAlert(`File type ${file.type} is not allowed.`, 'error');
            return false;
        }
    }
    return true;
}

function fileNumber(files) {
    if (files.length > 3) {
        showAlert('You can only upload up to 3 files at a time.', 'error');
        return false;
    }
    return true;
}

function fileSize(files) {
    const maxSize = 200 * 1024; // 200KB max size
    for (const file of files) {
        if (file.size > maxSize) {
            showAlert('File size must be under 200KB', 'error');
            return false;
        }
    }
    return true;
}

// Prevent duplicate uploads
function preventDuplicate(files) {
    for (const file of files) {
        if (uploadedFiles.includes(file.name)) {
            showAlert(`${file.name} is already uploaded.`, 'error');
            return false;
        }
    }
    return true;
}

// Handle notification
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 2000);
}

// Display selected file on screen
function displayFileNames(files) {
    fileNameContainer.innerHTML = '';
    const heading = document.createElement('h2');
    heading.textContent = 'Selected Files';
    fileNameContainer.appendChild(heading);

    Array.from(files).forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-name-container';
        if (file.type.startsWith('image/')) {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = file.name;
                img.style.display = 'block';

                const nameDiv = document.createElement('div');
                nameDiv.textContent = file.name;
                nameDiv.style.textAlign = 'center';

                fileDiv.appendChild(img);
                fileDiv.appendChild(nameDiv);
                appendDeleteIcon(fileDiv, file);

                fileNameContainer.appendChild(fileDiv);
            };
            fileReader.readAsDataURL(file);
        } else {
            const nameDiv = document.createElement('div');
            nameDiv.textContent = file.name;
            fileDiv.appendChild(nameDiv);
            appendDeleteIcon(fileDiv, file);
            fileNameContainer.appendChild(fileDiv);
        }
    });
}

// Delete icon for selected files
function appendDeleteIcon(fileDiv, file) {
    const deleteIcon = document.createElement('div');
    deleteIcon.textContent = 'X';
    deleteIcon.className = 'delete-icon';
    fileDiv.appendChild(deleteIcon);

    deleteIcon.addEventListener('click', () => {
        fileDiv.remove();
        filesToUpload = filesToUpload.filter(f => f !== file);
    });
}

// File upload
async function uploadFiles(files) {
    loader.style.display = 'block';

    for (const file of files) {
        if (!uploadedFiles.includes(file.name)) {
            const formData = new FormData();
            formData.append('upload_preset', 'hmocxr0o');
            formData.append('file', file);

            try {
                const response = await fetch('https://api.cloudinary.com/v1_1/dv97ekf0f/image/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const result = await response.json();
                console.log('file uploaded', result);

                uploadedFiles.push(file.name);
                displayUploadedFiles(file); 
                showAlert('File Uploaded Successfully!', 'success');
            } catch (error) {
                console.error('Upload error:', error);
                showAlert('An error occurred during file upload', 'error');
            }
        } else {
            showAlert(`${file.name}" already uploaded.`, 'error');
        }
    }
    loader.style.display = 'none';
    filesToUpload = [];
    fileNameContainer.innerHTML = '';
    fileInput.value = '';
}

function displayUploadedFiles(file) {
    const heading = uploadedFileContainer.querySelector('.uploaded-files-heading');
    if (!heading) {
        const newHeading = document.createElement('h2');
        newHeading.textContent = 'Uploaded Files';
        newHeading.className = 'uploaded-files-heading';
        uploadedFileContainer.appendChild(newHeading);
    }
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-name-container';
    fileDiv.style.border = '1px solid #cccccc';
    fileDiv.style.fontSize = '0.8em';
    fileDiv.style.padding = '1.5%';
    fileDiv.style.margin = '0';
    fileDiv.style.width = '100%';

    const nameDiv = document.createElement('div');
    nameDiv.textContent = file.name;

    const checkMark = document.createElement('div');
    checkMark.className = 'checkmark';
    checkMark.textContent = '✓';

    fileDiv.appendChild(nameDiv);
    fileDiv.appendChild(checkMark);
    uploadedFileContainer.appendChild(fileDiv);
}

function handleFiles(files) {
    if (validType(files) && fileNumber(files) && fileSize(files) && preventDuplicate(files)) {
        filesToUpload = Array.from(files);
        displayFileNames(files);
    }
}

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.border = '2px dotted rgb(146, 252, 60)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.border = '2px dashed #E9EAF9';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

browseBtn.addEventListener('click', () => {
    fileInput.click();
});

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (filesToUpload.length === 0) {
        showAlert('No files selected for upload.', 'error');
    } else {
        uploadFiles(filesToUpload);
    }
});
