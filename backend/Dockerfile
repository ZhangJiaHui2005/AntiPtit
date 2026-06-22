# --- Giai đoạn 1: Build mã nguồn ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Sao chép file project (.csproj) và tiến hành restore dependencies trước để tận dụng cache
COPY ["AntiPtit.API.csproj", "./"]
RUN dotnet restore "./AntiPtit.API.csproj"

# Sao chép toàn bộ code còn lại và build bản Release
COPY . .
RUN dotnet publish "AntiPtit.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# --- Giai đoạn 2: Môi trường chạy Production ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# ĐỒNG BỘ GIỜ: Cài đặt tzdata để ép container chạy đúng giờ Việt Nam
ENV TZ=Asia/Ho_Chi_Minh
RUN apt-get update && apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt-get clean

# Copy sản phẩm đã build từ Giai đoạn 1 qua
COPY --from=build /app/publish .

# Cổng mặc định của .NET 8/10 khi chạy container là 8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AntiPtit.API.dll"]