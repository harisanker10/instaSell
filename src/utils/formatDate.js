const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
 
  
const convertISODate = (data)=>{

    const date = new Date(data);
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} `;

} 

module.exports = convertISODate;