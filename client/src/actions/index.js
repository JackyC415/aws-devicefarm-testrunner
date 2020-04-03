import axios from 'axios';
import { UPLOAD_TEST } from './types'; 
export const submitTest = (file) => async dispatch =>{
    const uploadTest = await axios.get(`/api/upload-test?type=${file.type}`);
    await axios.put(uploadTest.data.url, file, {
        headers: {
            'Content-Type': file.type
        }
    });
    console.log("Complete. Upload completed");


}