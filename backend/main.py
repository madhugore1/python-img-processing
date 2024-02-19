from fastapi import FastAPI, File, UploadFile, Body
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageFilter

import io
import base64

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to the app!"}


@app.post("/upload")
def upload(file: UploadFile = File(...)):
    try:
        with Image.open(file.file) as im:
            im.save(file.filename)
    except Exception as e:
        return {"message": f"There was an error uploading the file: {e}"}
    finally:
        file.file.close()

    return file


@app.post("/rotate")
async def rotate(file: UploadFile = File(...), angle: float = Body(...)):
    try:
        with Image.open(file.file) as im:
            im_rotated = im.rotate(angle)

            with io.BytesIO() as output:
                im_rotated.save(output, format="JPEG")
                img_data = output.getvalue()

            encoded_img_str = base64.b64encode(img_data)

        return {"message": "Success!", "base64_img": encoded_img_str}
    
    except Exception as e:
        return {"message": "Error!", "error": e}
    

@app.post("/grayscale")
async def grayscale(file: UploadFile = File(...)):
    try:
        with Image.open(file.file) as im:
            # mode = "L" for grayscale
            im_grayscale = im.convert("L")

            with io.BytesIO() as output:
                im_grayscale.save(output, format="JPEG")
                img_data = output.getvalue()

            encoded_img_str = base64.b64encode(img_data)

        return {"message": "Success!", "base64_img": encoded_img_str}
    
    except Exception as e:
        return {"message": "Error!", "error": e}


thumbnail_size = (100, 150)

""" @app.post("/thumbnail")
def thumbnail(file: UploadFile = File(...)):
    try:
        with Image.open(file.file) as im:
            im.thumbnail(thumbnail_size)
            im.save(f"thumbnail_{file.filename}")

    except Exception as e:
        return {"message": f"There was an error uploading the file: {e}"}
    finally:
        file.file.close()

    filepath = f"D:/Madhura/Projects/fastapi-projects/athelas-practice/proj2/backend/thumbnail_{file.filename}"

    return FileResponse(filepath, media_type="image/jpeg") """


@app.post("/thumbnail")
def thumbnail(file: UploadFile = File(...)):
    try:
        with Image.open(file.file) as im:
            im.thumbnail(thumbnail_size)

            with io.BytesIO() as output:
                im.save(output, format="JPEG")
                img_data = output.getvalue()

            encoded_img_str = base64.b64encode(img_data)

        return {"message": "Success!", "base64_img": encoded_img_str}
    
    except Exception as e:
        return {"message": "Error!", "error": e}


@app.post("/compress")
async def compress(file: UploadFile = File(...)):
    try:
        with Image.open(file.file) as im:
            with io.BytesIO() as output:
                im.save(output, "JPEG", optimize=True, quality=20)
                img_data = output.getvalue()

                encoded_image_string = base64.b64encode(img_data)
    
        return {"base64_img": encoded_image_string, "message": "Success!"}
    
    except Exception as e:
        return {"message": f"Error occurred while reading file: {e}"}


@app.post("/process_multiple")
async def compress(files: list[UploadFile], filters: str = Body()):
    filter_arr = filters.split(",")
    result = []
    try:
        for idx, file in enumerate(files):
            output = await get_filter_base64(file, filter_arr[idx])
            result.append(output["data"] if output["type"] == "data" else output["error"])

    except Exception as e:
        print(e)
        return {"message": f"Error occurred while reading file: {e}"}

    return {"processed_imgs": result, "message": "Success!"}


@app.post("/apply_filter")
async def apply_filter(file: UploadFile, filter: str = Body(...), strength: int | None = Body(None)):
    output = await get_filter_base64(file, filter, strength)
    if output["type"] == "data":
        return {"message": "Success!", "base64_img": output["data"]}
    else:
        return {"message": "Success!", "error": output["error"]}


async def get_filter_base64(file: UploadFile, filter: str, strength: int | None = None):
    try:
        with Image.open(file.file) as im:
            with io.BytesIO() as output:
                match filter:
                    case "blur":
                        filter = ImageFilter.BoxBlur(strength if strength is not None else 3)

                    case "edge-detection":
                        filter = ImageFilter.EDGE_ENHANCE

                    case "sharpen":
                        filter = ImageFilter.SHARPEN

                    case _:
                        filter = ImageFilter.BLUR

                processed_img = im.filter(filter)
                processed_img.save(output, format="JPEG")
                img_data = output.getvalue()

            encoded_image_string = base64.b64encode(img_data)
            return {"type": "data", "data": encoded_image_string}

    except Exception as e:
        return {"type": "error", "error": e}