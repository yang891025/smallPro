const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/*  
 *  
 *  格式化时间
 *  传入10位或者13位时间戳，返回格式yyyy/mm/dd hh:mm:ss
 *  @ time : number 
 *  
 */
function formatDate(time) {
  let _time = time
  if (typeof _time !== 'number' || _time < 0) {
    return _time
  }
  if (_time.toString().length === 10) {
    _time = parseInt(_time.toString().concat('000'))
  }

  let date = new Date(_time)

  return ([date.getFullYear(), date.getMonth() + 1, date.getDate()]).map(function (item) {
    let _item = item.toString()
    return _item[1] ? _item : '0'.concat(_item)
  }).join("/").concat(" ").concat(([date.getHours(), date.getMinutes(), date.getSeconds()]).map(function (item) {
    let _item = item.toString()
    return _item[1] ? _item : '0'.concat(_item)
  }).join(":"))
}
module.exports = {
  formatTime: formatTime,
  formatDate: formatDate
}

