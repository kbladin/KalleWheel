function Convert2Bin(outstring, statstring, signBit, power, rounding)
{
  output = new String()                 //Output

  var binexpnt, index1, index2, cnst, bias, lastbit, rounded, index3, binexpnt2
  var moreBits

  cnst = 2102		// 1 (carry bit) + 1023 + 1 + 1022 + 53 + 2 (round bits)
  bias = 1024

  //init
  for (index1 = 0; index1 < this.Size; index1++)  this.Result[index1] = 0     

  with (Math) 					
  {
    //sign bit
    this.Result[0] = signBit

    //obtain exponent value
    index1 = 0

    if (this.Size == 32) index2 = 9
    else index2 = 12

    if (rounding && (outstring == ""))
    {
      //find most significant bit of significand
      while ((index1 < cnst) && (this.BinVal[index1] != 1)) index1++

      binexpnt = bias - index1

      //regular normalized numbers
      if (binexpnt >= this.MinExp)
      {
				//the value is shifted until the most
        index1++		//significant 1 is to the left of the binary
				//point and that bit is implicit in the encoding
      }//if normalized numbers

      //support for zero and denormalized numbers
      //exponent underflow for this precision
      else
      {
        binexpnt = this.MinExp - 1
        index1 = bias - binexpnt
      }//if zero or denormalized (else section)


      //use round to nearest value mode

      //compute least significant (low-order) bit of significand
      lastbit = this.Size - 1 - index2 + index1

      //the bits folllowing the low-order bit have a value of (at least) 1/2
      if (this.BinVal[lastbit + 1] == 1)
      {
        rounded = 0

        //odd low-order bit
        if (this.BinVal[lastbit] == 1)
        {
          //exactly 1/2 the way between odd and even rounds up to the even,
          //so the rest of the bits don't need to be checked to see if the value
          //is more than 1/2 since the round up to the even number will occur
          //anyway due to the 1/2
          rounded = 1
        }//if odd low-order bit

        //even low-order bit
        else  //this.BinVal[lastbit] == 0
        {
          //exactly 1/2 the way between even and odd rounds down to the even,
          //so the rest of the bits need to be checked to see if the value
          //is more than 1/2 in order to round up to the odd number
          index3 = lastbit + 2
          while ((rounded == 0) && (index3 < cnst))
          {
            rounded = this.BinVal[index3]
            index3++
          }//while checking for more than 1/2

        }//if even low-order bit (else section)

        //do rounding "additions"
        index3 = lastbit
        while ((rounded == 1) && (index3 >= 0))
        {
          // 0 + 1 -> 1 result with 0 carry
          if (this.BinVal[index3] == 0)
          {
            // 1 result
            this.BinVal[index3] = 1

            // 0 carry
            rounded = 0

          }//if bit is a 0

          // 1 + 1 -> 0 result with 1 carry
          else  //this.BinVal[index3] == 1
          {
            // 0 result
            this.BinVal[index3] = 0

            // 1 carry
//          rounded = 1
          }//if bit is a 1 (else section)

          index3--
        }//while "adding" carries from right to left in bits

      }//if at least 1/2

      //obtain exponent value
      index1 = index1 - 2
      if (index1 < 0) index1 = 0

    }//if rounding

    //find most significant bit of significand
    while ((index1 < cnst) && (this.BinVal[index1] != 1)) index1++

    binexpnt2 = bias - index1

    if (outstring == "")
    {
      binexpnt = binexpnt2

      //regular normalized numbers
      if ((binexpnt >= this.MinExp) && (binexpnt <= this.MaxExp))
      {
                                //the value is shifted until the most
        index1++                //significant 1 is to the left of the binary
                                //point and that bit is implicit in the encoding
      }//if normalized numbers

      //support for zero and denormalized numbers
      //exponent underflow for this precision
      else if (binexpnt < this.MinExp)
      {
        if (binexpnt2 == bias - cnst)
          //value is truely zero
          this.StatCond = "normal"
        else if (binexpnt2 < this.MinUnnormExp)
          this.StatCond = "underflow"
        else
          this.StatCond = "denormalized"

        binexpnt = this.MinExp - 1
        index1 = bias - binexpnt
      }//if zero or denormalized (else if section)
    }

    else //already special values
    {
      binexpnt = power
      index1 = bias - binexpnt

      //compute least significant (low-order) bit of significand
      lastbit = this.Size - 1 - index2 + index1

      moreBits = this.BinVal[lastbit]

      index3 = lastbit + 1
      while ((moreBits == 0) && (index3 < cnst))
      {
        moreBits = this.BinVal[index3]
        index3++
      }//while checking for more bits from other precision

      this.BinVal[lastbit] = moreBits

    }//if already special (else section)

    //copy the result
    while ((index2 < this.Size) && (index1 < cnst))
    {
      this.Result[index2] = this.BinVal[index1]
      index2++
      index1++
    }//while

    //max exponent for this precision
    if ((binexpnt > this.MaxExp) || (outstring != ""))
    {
      binexpnt = this.MaxExp + 1

      //overflow of this precision, set infinity
      if (outstring == "")
      {
        this.StatCond = "overflow"
        this.DispStr = "Infinity"

        if (this.Result[0] == 1)
          this.DispStr = "-" + this.DispStr

        if (this.Size == 32) index2 = 9
        else index2 = 12

        //zero the significand
        while (index2 < this.Size)
        {
          this.Result[index2] = 0
          index2++
        }//while

      }//if overflowed

      else //already special values
      {
        this.StatCond = statstring
        this.DispStr = outstring
      }//if already special (else section)

    }//if max exponent

    //convert exponent value to binary representation
    if (this.Size == 32) index1 = 8
    else index1 = 11
    this.BinaryPower = binexpnt
    binexpnt += this.ExpBias		//bias
    while ((binexpnt / 2) != 0)
    {
      this.Result[index1] = binexpnt % 2
      if (binexpnt % 2 == 0) binexpnt = binexpnt / 2
        else binexpnt = binexpnt / 2 - 0.5
      index1 -= 1
    }

    //output binary result
    output = ""
    for (index1 = 0; index1 < this.Size; index1++) 
      output = output + this.Result[index1]  
    return output

  }//with Math
}

function Hex2Bin(input)
{
  output = new String()                 //Output
  numerals = new String()

  var index1, nibble, i, s, binexpnt, cnst, bias, index2, zeroFirst, zeroRest
  var binexpnt2, index3

  cnst = 2102           // 1 (carry bit) + 1023 + 1 + 1022 + 53 + 2 (round bits)
  bias = 1024

  //init
  numerals = "0123456789ABCDEF"

  for (index1 = 0; index1 < cnst; index1++)  this.BinVal[index1] = 0

  for (index1 = 0; index1 < this.Size; index1++)  this.Result[index1] = 0

  with (Math)
  {

    input = RemoveBlanks(input)

    if (input.length > (this.Size / 4))
    {
      alert("too many hex digits")
      output = "exit"
      return output
    }

    else if (input.length < (this.Size / 4))
    {
      alert("too few hex digits")
      output = "exit"
      return output
    }

    else
    {
      input = input.toUpperCase()

      for (index1 = 0; index1 < this.Size; index1 +=4)
      {
        nibble = numerals.indexOf(input.charAt(index1 / 4))

        if (nibble == -1)
        {
          alert("invalid hex digit")
          output = "exit"
          return output
        }

        temp = nibble / 16

        for (i = 0; i < 4; i++)
        {
          temp *= 2
          if (temp >= 1)
          {
            this.Result[index1 + i] = 1
            temp --
          }
          else
            this.Result[index1 + i] = 0
        }
      }
    }

    //obtain exponent value
    binexpnt = 0

    if (this.Size == 32) index2 = 9
    else index2 = 12

    for (index1 = 1; index1 < index2; index1++)
      binexpnt += parseInt(this.Result[index1])*pow(2, index2 - index1 - 1)

    binexpnt -= this.ExpBias            //bias
    this.BinaryPower = binexpnt

    index1 = bias - binexpnt

    //regular normalized numbers
    if ((binexpnt >= this.MinExp) && (binexpnt <= this.MaxExp))
    {
      //the encoding's hidden 1 is inserted
      this.BinVal[index1] = 1
      index1++
    }//if normalized numbers

    index3 = index1

    //copy the input
    if (this.Result[index2] == 0)
      zeroFirst = true
    this.BinVal[index1] = this.Result[index2]
    index2++
    index1++

    zeroRest = true
    while ((index2 < this.Size) && (index1 < cnst))
    {
      if (this.Result[index2] == 1)
        zeroRest = false
      this.BinVal[index1] = this.Result[index2]
      index2++
      index1++
    }//while

    //find most significant bit of significand
    //for the actual denormalized exponent test for zero
    while ((index3 < cnst) && (this.BinVal[index3] != 1)) index3++
    binexpnt2 = bias - index3

    //zero and denormalized numbers
    if (binexpnt < this.MinExp)
    {
      if (binexpnt2 == bias - cnst)
        //value is truely zero
        this.StatCond = "normal"
      else if (binexpnt2 < this.MinUnnormExp)
        this.StatCond = "underflow"
      else
        this.StatCond = "denormalized"
    }//if zero or denormalized

    //max exponent for this precision
    else if (binexpnt > this.MaxExp)
    {
      if (zeroFirst && zeroRest)
      {
        //Infinity
        this.StatCond = "overflow"
        this.DispStr = "Infinity"
      }//if Infinity
      else if (!zeroFirst && zeroRest && (this.Result[0] == 1))
      {
        //Indeterminate quiet NaN
        this.StatCond = "quiet"
        this.DispStr = "Indeterminate"
      }//if Indeterminate quiet NaN (else if section)
      else if (!zeroFirst)
      {
        //quiet NaN
        this.StatCond = "quiet"
        this.DispStr = "NaN"
      }//if quiet NaN (else if section)
      else
      {
        //signaling NaN
        this.StatCond = "signaling"
        this.DispStr = "NaN"
      }//if signaling NaN (else section)

      if ((this.Result[0] == 1) && (this.DispStr != "Indeterminate"))
        this.DispStr = "-" + this.DispStr

    }//if max exponent (else if section)

    //output binary result
    output = ""
    for (index1 = 0; index1 < this.Size; index1++)
      output = output + this.Result[index1]
    return output

  }//with Math
}

function RemoveBlanks(input)
{
  output = new String()

  var start, stop

  start = 0
  while ((input.charAt(start) == " ") && (start < input.length))
    start++

  stop = input.length - 1
  while ((input.charAt(stop) == " ") && (stop >= 0))
    stop--

  output = input.substring(start, stop + 1)

  return output
}

function Convert2Hex()
{
  output = new String()
  numerals = new String()

  var temp, index, i

  numerals = "0123456789ABCDEF"

  with (Math)
  {
    //convert binary result to hex and output
    for (index = 0; index < this.Size; index +=4)
    {
      temp = 0
      for (i = 0; i < 4; i++)
        temp += pow(2, 3 - i)*this.Result[index + i]

      output = output + numerals.charAt(temp)
    }
  }
  return output
}

function numStrClipOff(input, precision)
{
  result = new String()
  numerals = new String()
  tempstr = new String()
  expstr = new String()
  signstr = new String()

  var locE, stop, expnum, locDP, start, MSD, MSDfound, index, expdelta, digits
  var number

  numerals = "0123456789";

  tempstr = input.toUpperCase()

  locE = tempstr.indexOf("E");
  if (locE != -1)
  {
    stop = locE
    expstr = input.substring(locE + 1, input.length)
    expnum = expstr * 1
  }
  else
  {
    stop = input.length
    expnum = 0
  }

  if (input.indexOf(".") == -1)
  {
    tempstr = input.substring(0, stop)
    tempstr += "."
    if (input.length != stop)
      tempstr += input.substring(locE, input.length)

    input = tempstr

    locE = locE + 1
    stop = stop + 1
  }

  locDP = input.indexOf(".");

  start = 0
  if (input.charAt(start) == "-")
  {
    start++
    signstr = "-"
  }
  else
    signstr = ""

  MSD = start
  MSDfound = false
  while ((MSD < stop) && !MSDfound)
  {
    index = 1
    while (index < numerals.length)
    {
      if (input.charAt(MSD) == numerals.charAt(index))
      {
        MSDfound = true
        break
      }
      index++
    }
    MSD++
  }
  MSD--

  if (MSDfound)
  {
    expdelta = locDP - MSD
    if (expdelta > 0)
      expdelta = expdelta - 1

    expnum = expnum + expdelta

    expstr = "e" + expnum
  }
  else  //No significant digits found, value is zero
    MSD = start

  digits = stop - MSD

  tempstr = input.substring(MSD, stop)

  if (tempstr.indexOf(".") != -1)
    digits = digits - 1

  number = digits
  if (precision < digits)
    number = precision

  tempstr = input.substring(MSD, MSD + number + 1)

  if ( (MSD != start) || (tempstr.indexOf(".") == -1) )
  {
    result = signstr
    result += input.substring(MSD, MSD + 1)
    result += "."
    result += input.substring(MSD + 1, MSD + number)

    while (digits < precision)
    {
      result += "0"
      digits += 1
    }

    result += expstr
  }
  else
  {
    result = input.substring(0, start + number + 1)

    while (digits < precision)
    {
      result += "0"
      digits += 1
    }

    if (input.length != stop)
      result += input.substring(locE, input.length)
  }

  return result;
}

function numCutOff(input, precision)
{
  result = new String()
  tempstr = new String()

  var temp = input;
  if(temp < 1)
    temp += 1;

  tempstr = "" + temp;

  tempstr = numStrClipOff(tempstr, precision);

  if(temp == input)
    result = tempstr.substring(0, 1);
  else
    result = "0";

  result += tempstr.substring(1, tempstr.length);

  return result;
}

function Convert2Dec()
{
  output = new String()

  var s, i, dp, val, hid, temp, decValue, power

  with (Math)
  {
  if (this.Size == 32) s = 9
  else s = 12

  if ((this.BinaryPower < this.MinExp) || (this.BinaryPower > this.MaxExp))
  {
    dp = 0
    val = 0
  }
  else
  {
    dp = - 1
    val = 1
  }

  for (i = s; i < this.Size; i++)
    val += parseInt(this.Result[i])*pow(2, dp + s - i)

  decValue = val * pow(2, this.BinaryPower)

  this.FullDecValue = decValue

  if (this.Size == 32)
  {
    s = 8
    if (val > 0)
    {
      power = floor( log(decValue) / LN10 )
      decValue += 0.5 * pow(10, power - s + 1)
      val += 5E-8
    }
  }
  else s = 17

  if (this.Result[0] == 1)
  {
    decValue = - decValue
    this.FullDecValue = - this.FullDecValue
  }

  //the system refuses to display negative "0"s with a minus sign
  this.DecValue = "" + decValue
  if ((this.DecValue == "0") && (this.Result[0] == 1))
    this.DecValue = "-" + this.DecValue

  this.DecValue = numStrClipOff(this.DecValue, s)

  output = numCutOff(val, s)

  } 
  return output
}

//object construction function
function ieee (Size){

  this.Size = Size
  this.BinaryPower = 0
  this.DecValue = ""
  this.FullDecValue = 0
  this.DispStr = ""
  this.Convert2Bin = Convert2Bin   //convert input to bin.
  this.Convert2Hex = Convert2Hex   //convert bin. to hex.
  this.Convert2Dec = Convert2Dec   //convert bin. significand to dec.
  this.Hex2Bin = Hex2Bin           //convert hex. to bin.
  this.StatCond = "normal"
  this.BinString = ""
  // 1 (carry bit) + 1023 + 1 + 1022 + 53 + 2 (round bits)
  this.BinVal = new Array(2102)    //Binary Representation
  if (Size == 32){
    this.ExpBias = 127
    this.MaxExp = 127
    this.MinExp = -126
    this.MinUnnormExp = -149
    this.Result = new Array(32)
  }
  else if (Size == 64){
    this.ExpBias = 1023
    this.MaxExp = 1023
    this.MinExp = -1022
    this.MinUnnormExp = -1074
    this.Result = new Array(64)
  }

}

function compute(obj, rounding){
/*
  in this javascript program, bit positions are numbered 
  0 ~ 32/64 from left to right instead of right to left, the
  way the output is presented
*/

  var index1, cnst

  ieee32 = new ieee(32)
  ieee64 = new ieee(64)

  ieee32.BinString = ieee32.Hex2Bin(obj.hex32b.value)
  if (ieee32.BinString != "exit")
  {
    obj.bin32_0.value = ieee32.BinString.substring(0, 1)
    obj.bin32_1.value = ieee32.BinString.substring(1, 9)
    if ((ieee32.BinaryPower < ieee32.MinExp) ||
        (ieee32.BinaryPower > ieee32.MaxExp))
    {
      obj.bin32_9.value = "  "
      obj.bin32_9.value += ieee32.BinString.substring(9, 10)
      obj.bin32_9.value += "."
      obj.bin32_9.value += ieee32.BinString.substring(10, 32)
    }
    else
    {
      obj.bin32_9.value = "1 ."
      obj.bin32_9.value += ieee32.BinString.substring(9, 32)
    }
    obj.stat32.value = ieee32.StatCond
    obj.binpwr32.value = ieee32.BinaryPower
    obj.binpwr32f.value = ieee32.BinaryPower + ieee32.ExpBias
    obj.dec32sig.value = ieee32.Convert2Dec()
    if (ieee32.DispStr != "")
    {
      obj.entered.value = ieee32.DispStr
      obj.dec32.value = ieee32.DispStr
      obj.dec32sig.value = ""
    }
    else
    {
      obj.entered.value = ieee32.FullDecValue
      obj.dec32.value = ieee32.DecValue
    }
    obj.hex32.value = ieee32.Convert2Hex()

    cnst = 2102         // 1 (carry bit) + 1023 + 1 + 1022 + 53 + 2 (round bits)
    for (index1 = 0; index1 < cnst; index1++)
      ieee64.BinVal[index1] = ieee32.BinVal[index1]

    ieee64.BinString =
      ieee64.Convert2Bin(ieee32.DispStr, ieee32.StatCond, ieee32.Result[0],
                         ieee32.BinaryPower, false)
    obj.bin64_0.value = ieee64.BinString.substring(0, 1)
    obj.bin64_1.value = ieee64.BinString.substring(1, 12)
    if ((ieee64.BinaryPower < ieee64.MinExp) ||
        (ieee64.BinaryPower > ieee64.MaxExp))
    {
      obj.bin64_12.value = "  "
      obj.bin64_12.value += ieee64.BinString.substring(12, 13)
      obj.bin64_12.value += "."
      obj.bin64_12.value += ieee64.BinString.substring(13, 64)
    }
    else
    {
      obj.bin64_12.value = "1 ."
      obj.bin64_12.value += ieee64.BinString.substring(12, 64)
    }
    obj.stat64.value = ieee64.StatCond
    obj.binpwr64.value = ieee64.BinaryPower
    obj.binpwr64f.value = ieee64.BinaryPower + ieee64.ExpBias
    obj.dec64sig.value = ieee64.Convert2Dec()
    if (ieee64.DispStr != "")
    {
      obj.dec64.value = ieee64.DispStr
      obj.dec64sig.value = ""
    }
    else
      obj.dec64.value = ieee64.DecValue
    obj.hex64.value = ieee64.Convert2Hex()
  }
}
