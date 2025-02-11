const verifyEmailTemplate = ({name, url})=>{
    return `
    <p>Dear ${name}</P>
    <P>Thank you for registering Shopping Online.</P>
    <a href=%{url} style="background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; width: 100%;">Verify Email</a>
    `
} 
    export default verifyEmailTemplate